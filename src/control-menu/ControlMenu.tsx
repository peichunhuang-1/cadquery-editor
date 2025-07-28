import { theme } from "antd";
import Sider from "antd/es/layout/Sider";
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useMenuStore } from '../hook/MenuStore';

type MenuItem = Required<MenuProps>['items'][number];
import {FolderOutlined, EditOutlined, SearchOutlined, CodepenOutlined} from '@ant-design/icons';

const items: MenuItem[] = [
  {
    icon: <FolderOutlined />,
    key: 'folder',
    label: 'Folder',
    title: ""
  }, 
  {
    icon: <EditOutlined />,
    key: 'editor',
    label: 'Editor',
    title: ""
  }, 
  {
    icon: <SearchOutlined/>,
    key: 'searcher',
    label: 'Searcher',
    title: ""
  },
  {
    icon: <CodepenOutlined/>,
    key: 'code open',
    label: 'Code Open',
    title: ""
  }
]

export function ControlMenu() {
    const { token } = theme.useToken();
    const { option, setOption, clearOption } = useMenuStore();

    const handleClick: MenuProps['onClick'] = (e) => {
        if (option === e.key) clearOption();
        else setOption(e.key);
    }
    return (
    <Sider style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: token.colorBgLayout,
            color: token.colorText,
            borderRight:`1px solid  ${token.colorBorder}`,
        }} width={'6vh'}>
            <Menu 
              style={{ width: '6vh', backgroundColor: token.colorBgLayout, borderRight: `1px solid  ${token.colorBorder}`}} 
              inlineCollapsed={true} 
              items={items} mode="inline"
              selectedKeys={option ? [option] : []}
              onClick={handleClick}> </Menu>
    </Sider>
    )
}