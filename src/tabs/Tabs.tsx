import { Tabs, theme } from 'antd';
import { useTabPagesStore } from '../hook/TabPagesStore';
import { Content } from 'antd/es/layout/layout';
import { useFileStore } from '../hook/FileStore';
import { useEffect } from 'react';

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

export function TabControl() {
    const { token } = theme.useToken();
    const { tabs, activeKey, add, remove, setActiveKey } = useTabPagesStore();
    const {fileList} = useFileStore();
    const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
        if (action === 'add') {
            add();
        } else {
            remove(targetKey);
        }
    };

    return (
        <Content style={{ backgroundColor: token.colorBgContainer }}>
            <Tabs
                items={tabs}
                style={{
                    backgroundColor: token.colorBgLayout,
                    color: token.colorText,
                }}
                tabBarStyle={{
                    margin: 0,
                    borderBottom: token.colorBorder,
                }}
                activeKey={activeKey}
                onChange={setActiveKey}
                size="small"
                onEdit={onEdit}
                type={fileList?.folder? "editable-card": "card"}
            />
        </Content>
    );
}
