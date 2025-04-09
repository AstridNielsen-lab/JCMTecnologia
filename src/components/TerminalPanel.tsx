import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minimize2, X } from 'lucide-react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TerminalPanel: React.FC<TerminalPanelProps> = ({ isOpen, onClose }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState('C:\\>');
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current || !isOpen) return;

    // Initialize terminal
    terminalInstance.current = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, monospace',
      theme: {
        background: '#000000',
        foreground: '#00ff00',
        cursor: '#00ff00',
        selection: 'rgba(0, 255, 0, 0.3)',
      },
    });

    // Initialize fit addon
    fitAddon.current = new FitAddon();
    terminalInstance.current.loadAddon(fitAddon.current);

    // Open terminal in container
    terminalInstance.current.open(terminalRef.current);
    fitAddon.current.fit();

    // Write initial prompt
    terminalInstance.current.writeln('Microsoft Windows [Version 10.0.19045.3803]');
    terminalInstance.current.writeln('(c) Microsoft Corporation. All rights reserved.');
    terminalInstance.current.writeln('');
    terminalInstance.current.write(currentDirectory);

    // Handle input
    let currentLine = '';
    terminalInstance.current.onKey(({ key, domEvent }) => {
      const ev = domEvent as KeyboardEvent;
      
      if (ev.keyCode === 13) { // Enter
        terminalInstance.current?.writeln('');
        handleCommand(currentLine.trim());
        currentLine = '';
        terminalInstance.current?.write(currentDirectory);
      } else if (ev.keyCode === 8) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          terminalInstance.current?.write('\b \b');
        }
      } else if (!ev.altKey && !ev.ctrlKey && !ev.metaKey) {
        currentLine += key;
        terminalInstance.current?.write(key);
      }
    });

    // Handle window resize
    const handleResize = () => {
      fitAddon.current?.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      terminalInstance.current?.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleCommand = async (command: string) => {
    if (!terminalInstance.current) return;

    const cmd = command.toLowerCase();
    
    switch (cmd) {
      case 'cls':
        terminalInstance.current.clear();
        break;
      case 'dir':
        terminalInstance.current.writeln('Directory of ' + currentDirectory);
        terminalInstance.current.writeln('');
        terminalInstance.current.writeln('04/01/2024  10:00 AM    <DIR>          .');
        terminalInstance.current.writeln('04/01/2024  10:00 AM    <DIR>          ..');
        terminalInstance.current.writeln('04/01/2024  10:00 AM    <DIR>          Documents');
        terminalInstance.current.writeln('04/01/2024  10:00 AM    <DIR>          Downloads');
        terminalInstance.current.writeln('               0 File(s)              0 bytes');
        terminalInstance.current.writeln('               4 Dir(s)  107,374,182,400 bytes free');
        break;
      case 'help':
        terminalInstance.current.writeln('Available commands:');
        terminalInstance.current.writeln('  cls     - Clear screen');
        terminalInstance.current.writeln('  dir     - List directory contents');
        terminalInstance.current.writeln('  help    - Show this help message');
        terminalInstance.current.writeln('  ver     - Show system version');
        terminalInstance.current.writeln('  exit    - Close terminal');
        break;
      case 'ver':
        terminalInstance.current.writeln('Microsoft Windows [Version 10.0.19045.3803]');
        break;
      case 'exit':
        onClose();
        break;
      case '':
        break;
      default:
        terminalInstance.current.writeln(`'${command}' is not recognized as an internal or external command,`);
        terminalInstance.current.writeln('operable program or batch file.');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed ${
        isMaximized 
          ? 'inset-0' 
          : 'bottom-4 left-4 w-[600px] h-[400px]'
      } bg-black border border-primary/30 rounded-lg shadow-lg z-40 flex flex-col`}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-2 bg-surface-dark border-b border-primary/30">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="h-4 w-4 text-primary" />
          <span className="text-primary text-sm">Command Prompt</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:bg-primary/20 rounded"
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4 text-primary" />
            ) : (
              <Maximize2 className="h-4 w-4 text-primary" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-primary/20 rounded"
          >
            <X className="h-4 w-4 text-primary" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-hidden p-1">
        <div ref={terminalRef} className="h-full" />
      </div>
    </div>
  );
};

export default TerminalPanel;