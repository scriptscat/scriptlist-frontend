import { useTranslation } from 'react-i18next';
import {
  Button,
  Form,
  InputNumber,
  Modal,
  Select,
  Switch,
  message,
} from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CreateInviteCode, GetInviteList } from '~/services/scripts/api';
import { CheckCircleTwoTone } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import ClipboardJS from 'clipboard';

export const InviteModal: React.FC<{
  status: boolean;
  onChange: (status: boolean) => void;
  id: number;
  groupID?: number;
}> = ({ status, onChange, id, groupID }) => {
  const { t } = useTranslation();
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [inviteCodeText, setInviteCodeText] = useState('');
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
        CreateInviteCode(id, groupID, {
          audit: values.audit,
          count: values.count,
          days: values.days,
        }).then((resp) => {
          if (resp.code == 0) {
            message.success(t('submit_success'));
            const inviteBaseURL =
              window.location.origin + '/invite-confirm?code=';
            setInviteCodeText(
              resp.data.code
                .map((code) => {
                  return inviteBaseURL + code;
                })
                .join('\n')
            );
            setOpenSuccessModal(true);
          } else {
            message.error(resp.msg);
          }
        });
      })
      .catch((err) => {});
  };
  const handleCancel = () => {
    onChange(false);
  };
  const [form] = Form.useForm();

  let clipboard: undefined | ClipboardJS = undefined;
  useEffect(() => {
    clipboard = new ClipboardJS('.copy-btn', {
      text: () => {
        return codeTextRef.current;
      },
    });

    clipboard.on('success', function (e: any) {
      message.success(t('copy_success'));
    });
    clipboard.on('error', function (e: any) {
      message.warning(t('copy_fail'));
    });
    return () => {
      clipboard?.destroy && clipboard.destroy();
    };
  }, []);

  return (
    <>
      <Modal
        title={t('create_invite_code')}
        open={status}
        onOk={handleOk}
        onCancel={handleCancel}
        cancelText={t('cancel')}
        okText={t('create')}
      >
        <div>
          <Form
            labelCol={{ span: 4 }}
            layout="horizontal"
            form={form}
            initialValues={{ layout: 'horizontal' }}
          >
            <Form.Item label={t('create_number')} name="count" initialValue={1}>
              <InputNumber className="!w-full" min={1} precision={0} />
            </Form.Item>
            <Form.Item label={t('expiry_date')} name="days" initialValue={0}>
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
              label={t('administrator_review')}
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
          <Button key="copy" className="copy-btn" type="primary">
            {t('copy_link')}
          </Button>,
          <Button key="back" onClick={() => setOpenSuccessModal(false)}>
            {t('disable')}
          </Button>,
        ]}
      >
        <div>
          <div className="mb-3">{t('create_invite_list_as_follows')}:</div>
          <TextArea
            value={inviteCodeText}
            autoSize={{ minRows: 5, maxRows: 10 }}
          />
        </div>
      </Modal>
    </>
  );
};
