import { theme } from "antd";
import { Content } from "antd/es/layout/layout";

export function DashBoard() {
    const { token } = theme.useToken();
    return (
        <Content style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: token.colorBgLayout,
            color: token.colorText,
            borderTop:`1px solid  ${token.colorBorder}`,
            height: '4vh',
            minHeight: '30px',
        }}>

        </Content>
    )
}