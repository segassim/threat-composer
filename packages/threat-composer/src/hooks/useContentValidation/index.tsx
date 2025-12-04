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
import { BaseChangeDetail } from '@cloudscape-design/components/input/interfaces';
import { NonCancelableCustomEvent, NonCancelableEventHandler } from '@cloudscape-design/components/internal/events';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import sanitizeHtml from '../../utils/sanitizeHtml';

/**
 * Decodes HTML entities (&lt; and &gt;) back to < and > inside mermaid code blocks.
 * This fixes the issue where MDXEditor encodes angle brackets when converting content to markdown.
 */
const decodeMermaidCodeBlocks = (input: string): string => {
  // Match mermaid code blocks: ```mermaid ... ```
  const mermaidBlockRegex = /```mermaid([\s\S]*?)```/g;
  
  return input.replace(mermaidBlockRegex, (_match, content) => {
    // Decode HTML entities inside the mermaid block content (fallback safety)
    const decodedContent = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    return `\`\`\`mermaid${decodedContent}\`\`\``;
  });
};

const useContentValidation = <T extends NonCancelableEventHandler<BaseChangeDetail> | ((newValue: string) => void)>(
  value: string,
  onChange?: T,
  validateData?: (newValue: string) => z.ZodSafeParseResult<string | undefined>,
) => {
  const [tempValue, setTempValue] = useState(value);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    setTempValue(value);
    if (!value) {
      setErrorText('');
    }
  }, [value]);

  const handleChange = useCallback((
    eventData: NonCancelableCustomEvent<BaseChangeDetail> | string,
    initialMarkdownNormalize?: boolean,
  ) => {
    // Skip processing if this is an initial markdown normalization
    if (initialMarkdownNormalize === true) {
      return;
    }

    let newValue = typeof eventData === 'string' ? eventData : eventData.detail.value;

    //Work around for https://github.com/mdx-editor/editor/issues/574
    // and https://github.com/mdx-editor/editor/issues/103 and
    newValue = newValue.split('\n').map(line => line.endsWith('&#x20;') ? line.slice(0, -6) : line).join('\n');

    // Decode HTML entities in mermaid code blocks (fixes MDXEditor encoding angle brackets)
    newValue = decodeMermaidCodeBlocks(newValue);

    setTempValue(newValue);
    const cleanValue = sanitizeHtml(newValue);

    if (cleanValue !== newValue) {
      setErrorText('Html tags not supported');
      return;
    }

    if (validateData) {
      const validation = validateData(newValue);
      if (!validation.success) {
        setErrorText(validation.error.issues.map(i => i.message).join('; '));
        return;
      }
    }

    setErrorText('');

    if (onChange) {
      if (typeof eventData === 'string') {
        (onChange as ((newValue: string) => void))?.(newValue);
      } else {
        (onChange as NonCancelableEventHandler<BaseChangeDetail>)?.(eventData);
      }
    }
  }, [setTempValue, setErrorText, onChange, validateData]);

  return {
    tempValue,
    handleChange,
    errorText,
  };
};

export default useContentValidation;
