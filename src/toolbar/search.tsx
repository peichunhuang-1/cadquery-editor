import { useState } from 'react';
import { Button, Space, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { theme } from "antd";

const Text = Typography.Text

export function SearchBar() {
    const [searchPrompt, setSearchPrompt] = useState<string>("");
    const { token } = theme.useToken();
    const [textColor, setTextColor] = useState<string>(token.colorTextLabel);
    return (
        <Button style={{width: '60vh', height: '100%', borderRadius: '6px'}} onMouseEnter={()=>setTextColor(token.colorPrimaryHover)} onMouseLeave={()=>setTextColor(token.colorTextLabel)}>
            {<Space><SearchOutlined style={{color: textColor}}/><Text style={{color: textColor}}>Search</Text></Space>}
        </Button>
    );
}