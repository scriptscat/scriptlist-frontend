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
  const [inviteCodeList, setInviteCodeLIst] = useState<Array<string>>([]);
  useEffect(() => {
    if (openSuccessModal === false) {
      setInviteCodeLIst([]);
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
            setInviteCodeLIst(resp.data.code);
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
  const inviteBaseURL = window.location.origin + '/invite-confirm?code=';
  let clipboard: undefined | ClipboardJS = undefined;
  const measuredRef = useCallback((node: HTMLElement) => {
    if (node !== null) {
      clipboard = new ClipboardJS(node, {
        text: () =>
          inviteCodeList
            .map((code) => {
              return inviteBaseURL + code;
            })
            .join('\n'),
      }); 

      clipboard.on('success', function (e: any) {
        message.success(t('copy_success'));
      });
      clipboard.on('error', function (e: any) {
        message.warning(t('copy_fail'));
      });
    }
  }, []);
  useEffect(() => {
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
          <Button ref={measuredRef} type="primary">
            {t('copy_link')}
          </Button>,
          <Button onClick={() => setOpenSuccessModal(false)}>
            {t('disable')}
          </Button>,
        ]}
      >
        <div>
          <div className="mb-3">{t('create_invite_list_as_follows')}:</div>
          <TextArea
            value={inviteCodeList
              .map((code) => {
                return inviteBaseURL + code;
              })
              .join('\n')}
            autoSize={{ minRows: 5, maxRows: 10 }}
          />
        </div>
      </Modal>
    </>
  );
};
