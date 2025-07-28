import { Layout, ConfigProvider } from 'antd';
import { ToolBar } from './toolbar/toolbar';
import { ControlMenu } from './control-menu/ControlMenu';
import { DashBoard } from './dashboard/DashBoard';
import { MainWindow } from './MainWindow';
import { useEffect } from 'react';
import { useFileStore } from './hook/FileStore';
import { useTabPagesStore } from './hook/TabPagesStore';

function App() {
  const {fileList, setFileList} = useFileStore();
  const {unlink} = useTabPagesStore();
  useEffect(()=>{
    const callback = (trigger: string, filename: string) => {
      if (!fileList) return;
      const parts = filename.split(/[/\\]/).filter(Boolean);
      const file = parts.pop();
      const folder = '/' + parts.join('/');
      if (folder !== fileList.folder) return;
      if (trigger === 'add') {
        // @ts-ignore
        setFileList({folder: fileList.folder, files: [...fileList.files!, file]});
      } else if (trigger === 'delete') {
        unlink(filename);
        setFileList({folder: fileList.folder, files: fileList.files.filter((filename)=> filename!==file)})
      }
    };
    window.api.file.onFolderEvent(callback);
    return () => {
      // @ts-ignore
      window.api.file.offFolderEvent(callback)
    };
  }, [fileList, setFileList]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0C72CC',
          borderRadius: 2,
          colorBgContainer: '#1E1E1E', 
          colorBgBase: '#1E1E1E',
          colorBorder: '#3C3C3C',
          colorBgLayout: '#1A1A1A',
          colorText: '#C4C4C4',
          colorTextSecondary: '#AAA',
        },
      }}
    >
      <Layout style={{height:'100%'}}>
        <ToolBar></ToolBar>
        <Layout style={{maxHeight:'92vh'}}>
            <ControlMenu></ControlMenu>
            <MainWindow></MainWindow>
        </Layout>
        <DashBoard></DashBoard>
      </Layout>
    </ConfigProvider>
  )
}



export default App