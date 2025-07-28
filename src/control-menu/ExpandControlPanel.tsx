import { theme } from "antd";
import { useMenuStore } from '../hook/MenuStore';
import {FileList} from './FolderList'
import Sider from "antd/es/layout/Sider";
import { ModelEditor } from "./ModelEditor";

export function ExpandControlPanel() {
    const { token } = theme.useToken();
    const option = useMenuStore((state) => state.option);
    const panels = {
      folder: <FileList />,
      editor: <div>Editor</div>,
      searcher: <div>Searcher</div>,
      'code open': <ModelEditor />
    };
    return (
    <Sider style={{
            backgroundColor: token.colorBgLayout,
            color: token.colorText,
            padding: option === 'code open'? '0px': '10px',
            height: '100%'
        }} width={'100%'}>
        {Object.entries(panels).map(([key, el]) => (
        <div key={key} style={{ display: option === key ? 'block' : 'none', height: '100%' }}>
            {el}
        </div>
        ))}
    </Sider>);
}