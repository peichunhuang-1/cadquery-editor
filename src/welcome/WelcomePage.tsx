import { Content } from "antd/es/layout/layout";
import { Space, theme } from 'antd';
import {BranchesOutlined, FolderOpenOutlined} from '@ant-design/icons';
import { Typography } from 'antd';
import { useFileStore } from '../hook/FileStore';

function CloneGitRepository() {
    const { token } = theme.useToken();
    const cloneProject = () => {

    }
    return (
        <Space style={{fontSize: '13px', fontFamily: 'monospace', fontWeight: 'normal', color: token.colorPrimary}}>
            <BranchesOutlined onClick={cloneProject}/>
            <Typography.Title style={{fontSize: '12px', color: token.colorPrimary, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} onClick={cloneProject}>Clone Git Repository...</Typography.Title>
        </Space>
    )
}

function OpenProject() {
    const { token } = theme.useToken();
    const initGitRepo = (folder: string, fileList: string[]) => {
        if (fileList.includes('.git') === false) {

        }
    }
    const openFileList = (folder: string, fileList: string[] | Error) => {
        if (fileList instanceof Error) return;
        else {
            initGitRepo(folder, fileList);
            useFileStore.getState().setFileList({folder: folder, files: fileList});
        }
    }
    const openFolder = (folder: string | Error) => {
        if (folder instanceof Error) return;
        else {
            window.api.file.listFiles(folder).then((fileList) => openFileList(folder, fileList));
        }
    }
    const openProject = () => {
        window.api.file.selectFolder().then(openFolder);
    }
    return (
        <Space style={{fontSize: '13px', fontFamily: 'monospace', fontWeight: 'normal', color: token.colorPrimary}}>
            <FolderOpenOutlined onClick={openProject}/>
            <Typography.Title style={{fontSize: '12px', color: token.colorPrimary, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden',textOverflow: 'ellipsis'}} onClick={openProject}>Open Project...</Typography.Title>
        </Space>
    )
}

export function WelcomePage() {
    const { token } = theme.useToken();
    return (
    <Content style={{height: '88.5vh', padding: '10vh', backgroundColor: token.colorBgContainer}}>
        <div>
            <div style={{fontSize: '30px', fontFamily: 'monospace', fontWeight: 'normal', color: token.colorText, whiteSpace: 'nowrap', overflow: 'hidden',textOverflow: 'ellipsis'}}>CadQuery Coder</div>
            <div style={{fontSize: '15px', fontFamily: 'monospace', fontWeight: 'normal', color: token.colorTextSecondary, whiteSpace: 'nowrap', overflow: 'hidden',textOverflow: 'ellipsis'}}>Editing evolved</div>
            <div style={{fontSize: '20px', fontFamily: 'monospace', fontWeight: 'bold', margin: '20px 0 10px 0', color:  token.colorText, whiteSpace: 'nowrap', overflow: 'hidden',textOverflow: 'ellipsis'}}>Start</div>
            <div>
                <OpenProject/>
            </div>
            <div>
                <CloneGitRepository/>
            </div>
            <div style={{fontSize: '20px', fontFamily: 'monospace', fontWeight: 'bold', margin: '20px 0 10px 0', color:  token.colorText, whiteSpace: 'nowrap', overflow: 'hidden',textOverflow: 'ellipsis'}}>Recent</div>
            {}
        </div>
    </Content>)
}