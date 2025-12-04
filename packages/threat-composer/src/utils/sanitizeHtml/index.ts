/** *******************************************************************************************************************
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 ******************************************************************************************************************** */
import sanitizeHtmlString from 'sanitize-html';

/**
 * Sanitizes a string while preserving mermaid code blocks.
 * Mermaid diagrams use < and > for arrows which should not be encoded.
 */
const sanitizeString = (str: string): string => {
  // Match mermaid code blocks: ```mermaid ... ```
  const mermaidBlockRegex = /```mermaid[\s\S]*?```/g;
  const mermaidBlocks: string[] = [];
  let blockIndex = 0;

  // Extract mermaid blocks and replace with placeholders
  const withPlaceholders = str.replace(mermaidBlockRegex, (match) => {
    const placeholder = `__MERMAID_BLOCK_${blockIndex}__`;
    mermaidBlocks.push(match);
    blockIndex++;
    return placeholder;
  });

  // Sanitize the string (this will encode < and > in non-mermaid content)
  let sanitized = sanitizeHtmlString(withPlaceholders, {
    allowedTags: [],
  });

  // Restore mermaid blocks (unencoded)
  mermaidBlocks.forEach((block, index) => {
    sanitized = sanitized.replace(`__MERMAID_BLOCK_${index}__`, block);
  });

  return sanitized;
};

const sanitizeHtml: any = (data: any) => {
  if (data) {
    if (Array.isArray(data)) {
      return data.map(d => sanitizeHtml(d));
    } else if (typeof data === 'string') {
      return sanitizeString(data);
    } else if (typeof data === 'object') {
      return Object.keys(data).reduce(
        (attrs, key) => ({
          ...attrs,
          [key]: sanitizeHtml(data[key]),
        }),
        {},
      );
    }
  }

  return data;
};

export default sanitizeHtml;