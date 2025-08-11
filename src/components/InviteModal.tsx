import {
  Button,
  Form,
  InputNumber,
  Modal,
  Select,
  Switch,
  message,
  theme,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { scriptAccessService } from '@/lib/api/services/scripts';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import TextArea from 'antd/es/input/TextArea';

export const InviteModal: React.FC<{
  status: boolean;
  onChange: (status: boolean) => void;
  id: number;
  groupID?: number;
}> = ({ status, onChange, id, groupID }) => {
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [inviteCodeText, setInviteCodeText] = useState('');
  const [loading, setLoading] = useState(false);
  const codeTextRef = useRef('');
  codeTextRef.current = inviteCodeText;

  useEffect(() => {
    if (openSuccessModal === false) {
      setInviteCodeText('');
    }
  }, [openSuccessModal]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        setLoading(true);
        scriptAccessService
          .createInvite(id, groupID, {
            audit: values.audit,
            count: values.count,
            days: values.days,
          })
          .then((resp) => {
            message.success('提交成功');
            const inviteBaseURL =
              window.location.origin + '/scripts/invite?code=';
            setInviteCodeText(
              resp.code
                .map((code) => {
                  return inviteBaseURL + code;
                })
                .join('\n'),
            );
            setOpenSuccessModal(true);
          })
          .catch((error) => {
            message.error(error.message || '创建失败');
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch((err) => {});
  };

  const handleCancel = () => {
    onChange(false);
  };

  const [form] = Form.useForm();
  const { token } = theme.useToken();

  return (
    <>
      <Modal
        title="创建邀请码"
        open={status}
        onOk={handleOk}
        onCancel={handleCancel}
        cancelText="取消"
        okText="创建"
        confirmLoading={loading}
      >
        <div>
          <Form
            labelCol={{ span: 4 }}
            layout="horizontal"
            form={form}
            initialValues={{ layout: 'horizontal' }}
          >
            <Form.Item label="创建数量" name="count" initialValue={1}>
              <InputNumber className="!w-full" min={1} precision={0} />
            </Form.Item>
            <Form.Item label="到期时间" name="days" initialValue={0}>
              <Select
                options={[
                  { value: 1, label: 1 + '天' },
                  { value: 3, label: 3 + '天' },
                  { value: 7, label: 7 + '天' },
                  { value: 15, label: 15 + '天' },
                  { value: 0, label: '无限制' },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="管理员审核"
              name="audit"
              initialValue={false}
              valuePropName="checked"
            >
              <Switch></Switch>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <Modal
        title={
          <div className="flex items-center">
            <CheckCircleTwoTone className="mr-1" twoToneColor="#52c41a" />
            <span>创建成功</span>
          </div>
        }
        onCancel={() => setOpenSuccessModal(false)}
        style={{ top: 10 }}
        open={openSuccessModal}
        footer={[
          <CopyToClipboard
            key="copy"
            text={inviteCodeText}
            onCopy={() => message.success('复制成功')}
          >
            <Button type="primary">复制链接</Button>
          </CopyToClipboard>,
          <Button key="back" onClick={() => setOpenSuccessModal(false)}>
            关闭
          </Button>,
        ]}
      >
        <div>
          <div className="mb-3">创建的邀请列表如下:</div>
          <TextArea
            className="!bg-transparent"
            value={inviteCodeText}
            autoSize={{ minRows: 5, maxRows: 10 }}
            readOnly
          />
        </div>
      </Modal>
    </>
  );
};
