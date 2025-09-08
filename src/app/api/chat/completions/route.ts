/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getModelById } from '@/lib/models';
import { ChatCompletionRequest } from '@/types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body: ChatCompletionRequest = await request.json();
    const { messages, model, temperature, maxTokens, stream, reasoningFormat, includeReasoning, reasoningEffort, webSearch, browserSearch, searchSettings } = body;

    if (!messages || !model) {
      return NextResponse.json({ error: 'Messages and model are required' }, { status: 400 });
    }

    const modelInfo = getModelById(model);
    if (!modelInfo) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    // Prepare messages with file content included
    const processedMessages = messages.map(msg => {
      let content = msg.content;
      
      // If message has attachments, include their text content
      if (msg.attachments && msg.attachments.length > 0) {
        const fileContents = msg.attachments.map(attachment => {
          if (attachment.textContent) {
            return `\n\n--- File: ${attachment.name} ---\n${attachment.textContent}\n--- End of ${attachment.name} ---`;
          }
          return `\n\n--- File: ${attachment.name} (content not extractable) ---`;
        }).join('\n');
        
        content += fileContents;
      }
      
      return {
        role: msg.role,
        content: content,
      };
    });

    // Calculate total tokens and adjust max_completion_tokens accordingly
    const estimatedInputTokens = processedMessages.reduce((total, msg) => {
      return total + Math.ceil(msg.content.length / 4); // Rough estimation: 4 chars per token
    }, 0);

    // Set appropriate max tokens based on model and input size
    let adjustedMaxTokens = maxTokens || 1024;
    if (estimatedInputTokens > 10000) {
      adjustedMaxTokens = Math.max(adjustedMaxTokens, 2048); // Increase for large inputs
    }
    if (estimatedInputTokens > 20000) {
      adjustedMaxTokens = Math.max(adjustedMaxTokens, 4096); // Further increase for very large inputs
    }

    // Prepare the request parameters
    const baseParams = {
      model,
      messages: processedMessages,
      temperature: temperature || 0.7,
      max_completion_tokens: adjustedMaxTokens,
    };

    // Add reasoning parameters for supported models
    if (modelInfo.supportsReasoning) {
      if (reasoningFormat) {
        (baseParams as any).reasoning_format = reasoningFormat;
      }
      if (includeReasoning !== undefined) {
        (baseParams as any).include_reasoning = includeReasoning;
      }
      if (reasoningEffort) {
        (baseParams as any).reasoning_effort = reasoningEffort;
      }
    }

    // Add web search for compound models
    if (modelInfo.supportsWebSearch && webSearch) {
      if (searchSettings) {
        (baseParams as any).search_settings = searchSettings;
      }
    }

    // Add browser search for supported models
    if (modelInfo.supportsBrowserSearch && browserSearch) {
      (baseParams as any).tools = [{ type: 'browser_search' }];
      (baseParams as any).tool_choice = 'required';
    }

    if (stream) {
      // Handle streaming response
      const completion = await groq.chat.completions.create({
        ...baseParams,
        stream: true,
      } as any);

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion as any) {
              const content = chunk.choices[0]?.delta?.content || '';
              const reasoning = chunk.choices[0]?.delta?.reasoning || '';
              
              const data = JSON.stringify({
                content,
                reasoning,
                done: chunk.choices[0]?.finish_reason === 'stop'
              });
              
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Handle non-streaming response
      const completion = await groq.chat.completions.create({
        ...baseParams,
        stream: false,
      } as any);
      
      return NextResponse.json(completion);
    }
  } catch (error) {
    console.error('Error in chat completion:', error);
    return NextResponse.json({ error: 'Failed to get completion' }, { status: 500 });
  }
}
