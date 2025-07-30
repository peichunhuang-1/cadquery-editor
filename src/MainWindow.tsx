import { Layout, Splitter, theme } from "antd";
import { ExpandControlPanel } from "./control-menu/ExpandControlPanel";
import { TabControl } from "./tabs/Tabs";
import { useMenuStore } from './hook/MenuStore';
export function MainWindow() {
  const { token } = theme.useToken();
  const option = useMenuStore((state) => state.option);

  return (
    <Layout style={{ width: '100vw', height: '92vh', flex: 'none' }}>
      <Splitter>
        <Splitter.Panel
          defaultSize={option === null ? '0%' : '16%'}
          min={option === null ? '0%' : '16%'}
          max={option === null ? '0%' : '70%'}
          collapsible={true}
          style={{
            borderRight: `1px solid ${token.colorBorder}`,
            minWidth: option === null ? '0' : '25vh',
            overflow: 'hidden'
          }}
        >
          <ExpandControlPanel />
        </Splitter.Panel>
        <Splitter.Panel>
          <TabControl />
        </Splitter.Panel>
      </Splitter>
    </Layout>
  );
}
