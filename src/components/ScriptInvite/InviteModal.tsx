import {
  Button,
  Form,
  InputNumber,
  Modal,
  Select,
  Switch,
  message,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { scriptAccessService } from '@/lib/api/services/scripts';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import TextArea from 'antd/es/input/TextArea';
import { useTranslations } from 'next-intl';

export const InviteModal: React.FC<{
  status: boolean;
  onChange: (status: boolean) => void;
  id: number;
  groupID?: number;
}> = ({ status, onChange, id, groupID }) => {
  const t = useTranslations('script.invite');
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
            message.success(t('submit_success'));
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
            message.error(error.message || t('create_failed'));
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch(() => {});
  };

  const handleCancel = () => {
    onChange(false);
  };

  const [form] = Form.useForm();

  return (
    <>
      <Modal
        title={t('create_invite_code')}
        open={status}
        onOk={handleOk}
        onCancel={handleCancel}
        cancelText={t('cancel')}
        okText={t('create')}
        confirmLoading={loading}
      >
        <div>
          <Form
            labelCol={{ span: 4 }}
            layout="horizontal"
            form={form}
            initialValues={{ layout: 'horizontal' }}
          >
            <Form.Item label={t('create_count')} name="count" initialValue={1}>
              <InputNumber className="!w-full" min={1} precision={0} />
            </Form.Item>
            <Form.Item label={t('expire_time')} name="days" initialValue={0}>
              <Select
                options={[
                  { value: 1, label: 1 + t('days') },
                  { value: 3, label: 3 + t('days') },
                  { value: 7, label: 7 + t('days') },
                  { value: 15, label: 15 + t('days') },
                  { value: 0, label: t('no_limit') },
                ]}
              />
            </Form.Item>
            <Form.Item
              label={t('admin_audit')}
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
            <span>{t('create_success')}</span>
          </div>
        }
        onCancel={() => setOpenSuccessModal(false)}
        style={{ top: 10 }}
        open={openSuccessModal}
        footer={[
          <CopyToClipboard
            key="copy"
            text={inviteCodeText}
            onCopy={() => message.success(t('copy_success'))}
          >
            <Button type="primary">{t('copy_link')}</Button>
          </CopyToClipboard>,
          <Button key="back" onClick={() => setOpenSuccessModal(false)}>
            {t('close')}
          </Button>,
        ]}
      >
        <div>
          <div className="mb-3">{t('invite_list_description')}</div>
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
