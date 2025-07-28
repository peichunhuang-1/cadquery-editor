import Editor from '@monaco-editor/react';
import { Content } from 'antd/es/layout/layout';
import {Monaco, registerCompletion, StandaloneCodeEditor} from 'monacopilot';
import { useTabPagesStore } from '../hook/TabPagesStore';
import { useEffect, useRef } from 'react';
import { CreateExecutor, UploadCode, DeleteExecutor, GetModelList, GetModel } from '../apis/CodeExecutor';
import { useModelStore } from '../hook/ModelStore';
import { MeshUIElement3D, MeshUIElement3DGroup } from '../control-menu/Model-Viewer/MeshUIElement3D';
import { basic_suggestion } from './Suggestion';

type CodeEditorProps = {
  content: string | null;
  id : string;
};

export function CodeEditor({ content, id }: CodeEditorProps) {
  const editorRef = useRef<StandaloneCodeEditor | null>(null);
  const idRef = useRef(id); 
  const group = useRef<MeshUIElement3DGroup>(new MeshUIElement3DGroup());
  const executorRef = useRef("");
  const { activeKey, recycle, refresh, unsave, addEditor, removeEditor } = useTabPagesStore();
  const { addModel } = useModelStore();
  useEffect(() => {
    return () => {
      removeEditor(idRef.current);
      DeleteExecutor(executorRef.current).then((res: any)=>{
        if (res.data.message) {
          // error handle
        }
      });
    };
  }, []);

  useEffect(() => {
    const root = useModelStore.getState().root;
    if (root) {
      root.add(group.current);
      return () => {
        root.remove(group.current);
      }
    } else {
      const unsubscribe = useModelStore.subscribe(
        (state) => state.root,
        (root, _) => {
          if (root) {
            root.add(group.current);
            group.current.layers.set(1);
          }
        }
      );
      return () => {
        useModelStore.getState().root.remove(group.current);
        unsubscribe();
      }
    }
  }, []);

  async function handleEditorDidMount(editor: StandaloneCodeEditor, monaco: Monaco) {
    const res: any = await CreateExecutor();
    if (res.data.message) {
      // error handle
    } else {
      executorRef.current = res.data.id;
    }
    editorRef.current = editor;
    addEditor(idRef.current, editorRef);
    const save = () => {
      if (activeKey !== idRef.current) return;
      const currentContent = editor.getValue();
      if (/^([1-9]|[1-9][0-9])$/.test(idRef.current)) {
        window.api.file.createFile().then((filePath) => {
          if (filePath instanceof Error) return;
          window.api.file.writeFile(filePath, currentContent).then((error) => {
            if (error instanceof Error) return;
            const parts = filePath.split(/[/\\]+/).filter(Boolean);
            const file = parts.pop() || '';
            const folder = '/' + parts.join('/');
            recycle(idRef.current, folder, file);
            idRef.current = filePath;
            refresh(idRef.current);
          });
        });
      } else {
        window.api.file.writeFile(idRef.current, currentContent).then((error) => {
          if (error instanceof Error) return;
          refresh(idRef.current);
        });
      }
    }
    const completion = registerCompletion(monaco, editor, {
      language: 'python',
      endpoint: 'http://localhost:3000/code-completion',
      trigger: 'onDemand',
      onError: error => {
        console.error(error);
      },
    });

    monaco.languages.registerCompletionItemProvider('python', basic_suggestion);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      save();
    });
    editor.addCommand(monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyZ, () => {
      save();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
      editor.trigger("keyboard", "undo", null);
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ, () => {
      editor.trigger("keyboard", "redo", null);
    });
    editor.addCommand(monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyY, () => {
      editor.trigger("keyboard", "redo", null);
    });
    editor.addAction({
      id: 'copilot',
      label: 'Ask copilot',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP],
      precondition: "editorLangId == 'python'",
      keybindingContext: "editorLangId == 'python'",
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: () => {
        if (activeKey !== idRef.current) return;
        completion.trigger();
      }
    });
    editor.addAction({
      id: 'run',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR],
      precondition: "editorLangId == 'python'",
      keybindingContext: "editorLangId == 'python'",
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: async ()=>{
        if (activeKey !== idRef.current) return;
        const res: any = await UploadCode(executorRef.current, editor.getValue());
        if (res.data.message) {
          // error handle
        } else {
          const res: any = await GetModelList(executorRef.current);
          if (res.data.message) {
            // error handle
          } else {
            addModel(idRef.current, res.data.models);
            group.current.clear();
            group.current.layers.set(1);
            res.data.models.forEach((model: string) => {
              GetModel(executorRef.current, model).then((res: any)=>{
                if (res.data.message) {
                  // error handle
                } else {
                  // create model view
                  const pts = res.data.points.map(([x, y, z]: number[]) => ({ x, y, z }));
                  const edges = Object.values(res.data.edges);
                  const faces = Object.values(res.data.faces).map((face: any) =>
                    ({ triangles: Object.values(face) })
                  );
                  const vertices = Object.values(res.data.vertices);
                  // @ts-ignore
                  const mesh = new MeshUIElement3D({points: pts, edges: edges, faces: faces, vertices: vertices});
                  requestAnimationFrame(() => {
                    group.current.add(mesh);
                  });
                }
              });
            });
          }
        }
      }
    });
    editor.addAction({
      id: 'unload',
      label: 'Unload',
      run: ()=>{
        if (activeKey !== idRef.current) return;
        group.current.UnLoad();
      }
    });
    editor.onDidChangeModelContent(() => {
      if (editor.getValue() !== content) unsave(idRef.current);
    });
  }
  
  return (
    <Content>
      <Editor
        height="87vh"
        defaultLanguage="python"
        defaultValue={content || `@workplane\ndef box():\n    return cq.Workplane('XY').box(1, 2, 3)`}
        theme="vs-dark"
        options={{ minimap: { enabled: false } }}
        onMount={handleEditorDidMount}
      />
    </Content>
  );
}
