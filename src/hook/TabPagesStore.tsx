import { TabsProps } from 'antd';
import { create } from 'zustand';
import {WelcomePage} from '../welcome/WelcomePage'
import { CodeEditor } from '../editor/CodeEditor';
import urlJoin from 'url-join';
import { Typography } from 'antd';
import { theme } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons'

const { Text } = Typography;

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

type TabPagesStore = {
    tabs: TabsProps['items'];
    editors: Record<string, any>;
    untitled: number[];
    activeKey: string;
    setActiveKey: (key: string) => void;
    add: ()=>void;
    recycle: (oldKey: string, folder: string, file: string)=>void;
    open: (folder: string, file: string)=>void;
    remove: (key: TargetKey)=>void;
    unsave: (key: TargetKey)=>void;
    unlink: (key: TargetKey)=>void;
    refresh: (key: TargetKey)=>void;
    addEditor: (key: TargetKey, ref: any)=>void;
    removeEditor: (key: TargetKey)=>void;
};

function UnsavedLabel({label}: {label: string}) {
    const { token } = theme.useToken();
    return (
        <span>{label} <ExclamationCircleOutlined/></span>
    );
}

function TabPageLabel({label, saved, unlinked}: {label: string, saved: boolean, unlinked: boolean}) {
    const { token } = theme.useToken();
    return (
        unlinked? <Text delete style={{color: token.colorErrorText, fontFamily: 'inherit', paddingLeft: '3px', paddingRight: '3px'}}> {saved? label : <UnsavedLabel label={label}/>} </Text>: 
            <Text style={{fontFamily: 'inherit', paddingLeft: '3px', paddingRight: '3px'}}>{saved? label: <UnsavedLabel label={label}/>}</Text>
    );
}

export const useTabPagesStore = create<TabPagesStore>((set, get) => ({
    tabs: [
        {
        label: <TabPageLabel label={'Welcome'} saved={true} unlinked={false}/>,
        key: '0',
        children: <WelcomePage />,
        },
    ],
    editors: {},
    untitled: Array.from({ length: 99 }, (_, i) => i + 1),
    activeKey: '0',
    setActiveKey: (key) => {
        const {editors, activeKey} = get();
        editors[activeKey]?.current.getAction("unload")?.run();
        set({ activeKey: key });
    },
    add: () => {
        const { tabs, untitled, editors, activeKey } = get();
        if (untitled.length === 0 || !tabs) return;
        editors[activeKey]?.current.getAction("unload")?.run();
        const newKey = String(untitled[0]);
        const newTabs = [
            ...tabs,
            {
                label: <TabPageLabel label={`Untitled-${newKey}`} saved={true} unlinked={false}/>,
                key: newKey,
                children: (
                    <CodeEditor content={null} id={newKey}/>
                )
            }
        ];
        set({
            tabs: newTabs,
            untitled: untitled.slice(1),
            activeKey: newKey,
        });
    },
    recycle: (oldKey: string, folder: string, file: string) => {
        const { tabs, untitled, editors } = get();
        if ( !tabs) return;
        const newKey = urlJoin(folder, file);
        const targetIndex = tabs.findIndex((tab) => tab.key === oldKey);
        if (targetIndex === -1) return;
        window.api.file.readFile(newKey).then((content) => {
            if (content instanceof Error) {
                window.api.log.log(content.message, 'error');
                return;
            }
            else {
                const newTabs = [...tabs];
                newTabs[targetIndex] = 
                {
                    label: <TabPageLabel label={file} saved={true} unlinked={false}/>,
                    key: newKey,
                    children: (
                        <CodeEditor content={content} id={newKey}/>
                    )
                };
                const new_editors = editors;
                new_editors[newKey] = new_editors[oldKey];
                delete new_editors[oldKey];
                const recycled = [...untitled, Number(oldKey)].sort((a, b) => a - b);
                set({
                    tabs: newTabs,
                    activeKey: newKey,
                    untitled: recycled,
                    editors: new_editors
                });
            }
        });
    },
    unsave: (key: TargetKey) => {
        const { tabs } = get();
        if ( !tabs) return;
        const targetIndex = tabs.findIndex((tab) => tab.key === key);
        if (targetIndex === -1) return;
        const tab = tabs[targetIndex];
        const newTab = {
            ...tab,
            label: (
            <TabPageLabel
                label={(tab.label as any).props.label}
                saved={false}
                unlinked={(tab.label as any).props.unlinked}
            />
            ),
        };
        const newTabs = [...tabs];
        newTabs[targetIndex] = newTab;
        set({ tabs: newTabs });
    },
    unlink: (key: TargetKey) => {
        const { tabs } = get();
        if ( !tabs) return;
        const targetIndex = tabs.findIndex((tab) => tab.key === key);
        if (targetIndex === -1) return;
        const tab = tabs[targetIndex];
        const newTab = {
            ...tab,
            label: (
            <TabPageLabel
                label={(tab.label as any).props.label}
                saved={(tab.label as any).props.saved}
                unlinked={true}
            />
            ),
        };
        const newTabs = [...tabs];
        newTabs[targetIndex] = newTab;
        set({ tabs: newTabs });
    },
    refresh: (key: TargetKey) => {
        const { tabs } = get();
        if ( !tabs) return;
        const targetIndex = tabs.findIndex((tab) => tab.key === key);
        if (targetIndex === -1) return;
        const tab = tabs[targetIndex];
        const newTab = {
            ...tab,
            label: (
            <TabPageLabel
                label={(tab.label as any).props.label}
                saved={true}
                unlinked={false}
            />
            ),
        };
        const newTabs = [...tabs];
        newTabs[targetIndex] = newTab;
        set({ tabs: newTabs });
    },
    open: (folder: string, file: string) => {
        const { tabs, editors, activeKey } = get();
        if ( !tabs) return;
        const filePath = urlJoin(folder, file);
        editors[activeKey]?.current.getAction("unload")?.run();
        if (tabs.findIndex((tab) => tab.key === filePath) !== -1) {
            set({
                activeKey: filePath,
            })
            return;
        }
        window.api.file.readFile(filePath).then((content) => {
            if (content instanceof Error) {
                window.api.log.log(content.message, 'error');
                return;
            }
            else {
                const newTabs = [
                    ...tabs,
                    {
                        label: <TabPageLabel label={file} saved={true} unlinked={false}/>,
                        key: filePath,
                        children: (
                            <CodeEditor content={content} id={filePath}/>
                        )
                    }
                ];
                set({
                    tabs: newTabs,
                    activeKey: filePath,
                });
            }
        });
    },
    remove: (key: TargetKey)=> {
        const { tabs, untitled, activeKey } = get();
        if (!tabs) return;
        const targetIndex = tabs.findIndex((tab) => tab.key === key);
        const newTabs = tabs.filter((tab) => tab.key !== key);

        const recycled =
            /^([1-9]|[1-9][0-9])$/.test(key as string) ? [...untitled, Number(key)].sort((a, b) => a - b) : untitled;

        const newActive =
            activeKey === key
                ? newTabs[targetIndex === newTabs.length ? targetIndex - 1 : targetIndex]?.key || '0'
                : activeKey;

        set({
            tabs: newTabs,
            untitled: recycled,
            activeKey: newActive,
        });
    },
    addEditor: (key: TargetKey, ref: any) => {
        const {editors} = get();
        const new_editors = {...editors, [key as string]: ref};
        set({editors: new_editors});
    },
    removeEditor: (key: TargetKey) => {
        const {editors} = get();
        const new_editors = editors;
        delete new_editors[key as string];
        set({editors: new_editors});
    }

}));