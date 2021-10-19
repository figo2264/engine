import React, { useEffect, useState } from 'react';
import MonacoEditor from "@monaco-editor/react";
// @ts-ignore: library file import
import Panel from '@playcanvas/pcui/Panel/component';
// @ts-ignore: library file import
import Container from '@playcanvas/pcui/Container/component';
// @ts-ignore: library file import
import Button from '@playcanvas/pcui/Button/component';
import { playcanvasTypeDefs } from './helpers/raw-file-loading';
import { File } from './helpers/types';

const FILE_TYPE_LANGUAGES: any = {
    'json': 'json',
    'shader': null,
    'javascript': 'javascript',
    'typescript': 'typescript'
};


let monacoEditor: any;

interface CodeEditorProps {
    files: Array<File>,
    setFiles: (value: Array<File>) => void,
    setLintErrors: (value: boolean) => void,
    useTypescript: boolean
}

const CodeEditor = (props: CodeEditorProps) => {
    const files: Array<File> = JSON.parse(JSON.stringify(props.files));
    const [selectedFile, setSelectedFile] = useState(0);

    const beforeMount = (monaco: any) => {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
            playcanvasTypeDefs,
            '@playcanvas/playcanvas.d.ts'
        );
    };

    const editorDidMount = (editor: any) => {
        monacoEditor = editor;
    };

    const onChange = (value: string) => {
        files[selectedFile].text = value;
        props.setFiles(files);
        props.setLintErrors(false);
    };

    const onValidate = (markers: Array<any>) => {
        // filter out markers which are warnings
        if (markers.filter((m) => m.severity > 1).length === 0) {
            props.setFiles(files);
            props.setLintErrors(false);
        } else {
            props.setLintErrors(true);
        }
    };

    const selectFile = (selectedFileIndex: number) => {
        setSelectedFile(selectedFileIndex);
        monacoEditor?.setScrollPosition({ scrollTop: 0, scrollLeft: 0 });
        document.querySelectorAll('#codePane .tabs-container .pcui-button').forEach((node: HTMLElement, i: number) => {
            if (selectedFileIndex === i) {
                node.classList.add('selected');
            } else {
                node.classList.remove('selected');
            }
        });
    };

    useEffect(() => {
        const codePane = document.getElementById('codePane');
        if (files.length > 2) {
            codePane.classList.add('multiple-files');
        } else {
            codePane.classList.remove('multiple-files');
        }
        if (!files[selectedFile]) setSelectedFile(props.useTypescript ? 1 : 0);
        if (props.useTypescript && selectedFile === 0) {
            selectFile(1);
        } else if (!props.useTypescript && selectedFile === 1) {
            selectFile(0);
        }
        if ((window as any).toggleEvent) return;
        // set up the code panel toggle button
        const panelToggleDiv = codePane.querySelector('.panel-toggle');
        panelToggleDiv.addEventListener('click', function () {
            codePane.classList.toggle('collapsed');
            localStorage.setItem('codePaneCollapsed', codePane.classList.contains('collapsed') ? 'true' : 'false');
        });
        (window as any).toggleEvent = true;
    });

    return <Panel headerText='CODE' id='codePane' class={localStorage.getItem('codePaneCollapsed') !== 'false' ? 'collapsed' : null}>
        <div className='panel-toggle' id='codePane-panel-toggle'/>
        { props.files && props.files.length > 2 && <Container class='tabs-container'>
            {props.files.map((file: File, index: number) => {
                const hidden = (props.useTypescript && index === 0 || !props.useTypescript && index === 1);
                return <Button key={index} id={`code-editor-file-tab-${index}`} hidden={hidden} text={file.name.indexOf('.') === -1 ? `${file.name}.${file.type}` : file.name} class={index === selectedFile ? 'selected' : ''} onClick={() => selectFile(index)}/>;
            })}
        </Container>
        }
        <MonacoEditor
            language={FILE_TYPE_LANGUAGES[files[selectedFile]?.type]}
            value={files[selectedFile]?.text}
            beforeMount={beforeMount}
            onMount={editorDidMount}
            onChange={onChange}
            onValidate={onValidate}
            options={{
                scrollbar: {
                    horizontal: 'visible'
                }
            }}
        />
    </Panel>;
};

export default CodeEditor;
