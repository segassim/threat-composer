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
import { Mode } from '@cloudscape-design/global-styles';
import { FC, useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useThemeContext } from '../ThemeProvider';

export interface MermaidDiagramProps {
  chart: string;
}

/**
 * MermaidDiagram renders mermaid diagrams from markdown syntax.
 * Supports theme switching and handles rendering errors gracefully.
 */
const MermaidDiagram: FC<MermaidDiagramProps> = ({ chart }) => {
  const { theme } = useThemeContext();
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<string>(`mermaid-diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Initialize mermaid with theme
    const mermaidTheme = theme === Mode.Dark ? 'dark' : 'default';
    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });
  }, [theme]);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart) {
        setSvg('');
        setError('');
        return;
      }

      try {
        // Clean up the chart string - remove extra whitespace
        const cleanChart = chart.trim();
        
        if (!cleanChart) {
          setSvg('');
          setError('');
          return;
        }

        // Generate unique ID for this render
        const id = `${idRef.current}-${Date.now()}`;
        
        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(id, cleanChart);
        setSvg(renderedSvg);
        setError('');
      } catch (err: any) {
        console.error('Mermaid rendering error:', err);
        setError(err?.message || 'Failed to render diagram');
        setSvg('');
      }
    };

    renderDiagram();
  }, [chart, theme]);

  if (error) {
    return (
      <div
        style={{
          padding: '1rem',
          border: '1px solid #d13212',
          borderRadius: '4px',
          backgroundColor: '#fef6f6',
          color: '#d13212',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
        }}
      >
        <strong>Mermaid Diagram Error:</strong>
        <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return <div>Loading diagram...</div>;
  }

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '1rem 0',
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidDiagram;


