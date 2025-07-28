import { Layout, theme, Flex, Button } from 'antd';
const { Header } = Layout;
import {CaretRightOutlined} from '@ant-design/icons'
import { useTabPagesStore } from '../hook/TabPagesStore';
import { SearchBar } from './search';
export function ToolBar() {
    const { token } = theme.useToken();
    const {editors, activeKey} = useTabPagesStore();
    return (
        <Header
            style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: token.colorBgLayout,
                color: token.colorText,
                height: '4vh',
                width: '100%',
                minHeight: '30px',
                borderBottom:`1px solid  ${token.colorBorder}`
            }}
        >
            <Flex align='center' justify='center' style={{width: '100%', height: '80%'}}>
                <SearchBar/>
            </Flex>
            <Button style={{height: '80%'}} icon={<CaretRightOutlined/>} onClick={()=>{editors[activeKey]?.current.getAction("run")?.run();}}></Button>
        </Header>
    )
}