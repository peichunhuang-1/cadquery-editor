import { Button, List } from "antd";
import { useFileStore } from "../hook/FileStore";
import { Typography } from 'antd';
import { useState } from "react";
import { RightOutlined, DownOutlined } from '@ant-design/icons';
import { useTabPagesStore } from "../hook/TabPagesStore";

const { Title, Text } = Typography;

export function FileList() {
    const folder = useFileStore((state) => state);
    const [collapseFolder, setCollapseFolder] = useState<boolean>(true);
    const { open } = useTabPagesStore();
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
        folder.fileList? 
        <div style={{width: '100%'}}>
            <Title style={{fontSize: '12px', fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden',textOverflow: 'ellipsis' }} onClick={()=>{setCollapseFolder(!collapseFolder)}}>
                {collapseFolder ? (
                    <RightOutlined style={{ fontSize: '11px', marginRight: '8px' }} />
                ) : (
                    <DownOutlined style={{ fontSize: '11px', marginRight: '8px' }} />
                )}
                {(folder.fileList?.folder?.split(/[/\\]/).filter(Boolean).pop())?.toUpperCase()}
            </Title>
            { collapseFolder? <></> :
            <List
                style={{marginLeft: '40px'}}
                className="compact-file-list"
                itemLayout="horizontal"
                dataSource={folder.fileList?.files || []}
                renderItem={(file) => (
                <List.Item onClick={()=>{ open(folder.fileList?.folder || '', file)}} >
                    <List.Item.Meta
                    title={<Text style={{ fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden',textOverflow: 'ellipsis' }}>{file}</Text>}
                    />
                </List.Item>)}>
            </List>}
        </div> :
        <div style={{width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Title style={{fontSize: '12px', fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden',textOverflow: 'ellipsis'}} 
                onClick={()=>{setCollapseFolder(!collapseFolder)}}>
                {collapseFolder ? (
                    <RightOutlined style={{ fontSize: '11px', marginRight: '8px' }} />
                ) : (
                    <DownOutlined style={{ fontSize: '11px', marginRight: '8px' }} />
                )}
                NO FOLDER OPENED
            </Title>
            { collapseFolder? <></> :
                <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'left', gap: '20px' }}>
                    <Text style={{marginLeft: '5%',width: '80%'}}>You have not yet opened a folder.</Text>
                    <Button type="primary" style={{marginLeft: '10%',width: '80%', maxWidth: '20vh', boxShadow: 'none'}} onClick={openProject}>Open Folder</Button>
                    <Text style={{marginLeft: '5%',width: '80%'}}>You can clone a repository locally.</Text>
                    <Button type="primary" style={{marginLeft: '10%',width: '80%', maxWidth: '20vh', boxShadow: 'none'}}>Clone Repo.</Button>
                </div>
            }
        </div>
    );
}