import { Form, Input, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import * as React from 'react'
import { FormattedMessage, InjectedIntlProps, injectIntl, intlShape } from 'react-intl'

import { ILabel } from '../../../components'
import { Authorized, RoleTypes } from '../../../components/authorized'
import { formItemLayout } from '../../../components/form'
import Layout from '../../../components/form/Layout'
import Submit from '../../../components/form/Submit'
import { httpGet, httpPost } from '../../../utils/request'

const FormItem = Form.Item

interface IState {
  title: ILabel,
}

class Widget extends React.Component<InjectedIntlProps & FormComponentProps, IState> {
  public static propTypes: React.ValidationMap<any> = {
    intl: intlShape.isRequired,
  }
  constructor(props: InjectedIntlProps & FormComponentProps) {
    super(props)
    this.state = {
      title: { id: 'nut.admin.site.smtp.title' }
    }
  }
  public handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { form, intl } = this.props
    form.validateFields((err, values) => {
      if (!err) {
        httpPost(`/admin/site/smtp`, values).then((_) => {
          message.success(intl.formatMessage({ id: "flashes.success" }))
        }).catch(message.error)
      }
    })
  }
  public comparePasswords = (_: any, value: string, callback: (m?: string) => void) => {
    const { form, intl } = this.props
    if (value && value !== form.getFieldValue('password')) {
      callback(intl.formatMessage({ id: "form.validations.password-confirmation" }))
    } else {
      callback()
    }
  }
  public componentDidMount() {
    const { form } = this.props
    httpGet(`/admin/site/smtp`).then((rst) => {
      form.setFieldsValue({ host: rst.host, email: rst.email })
    }).catch(message.error)
  }

  public render() {
    const { formatMessage } = this.props.intl
    const { getFieldDecorator } = this.props.form

    return (<Authorized authority={RoleTypes.ADMIN}>
      <Layout title={this.state.title}>
        <Form onSubmit={this.handleSubmit}>

          <FormItem {...formItemLayout} label={<FormattedMessage id="form.labels.host" />}>
            {
              getFieldDecorator('host', {
                rules: [
                  {
                    message: formatMessage({ id: "form.validations.required" }),
                    required: true,
                  }
                ]
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label={<FormattedMessage id="form.labels.email" />}>
            {
              getFieldDecorator('email', {
                rules: [
                  {
                    message: formatMessage({ id: "form.validations.email" }),
                    required: true,
                    type: 'email',
                  }
                ]
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label={<FormattedMessage id="form.labels.password" />}>
            {
              getFieldDecorator('password', {
                rules: [
                  {
                    max: 32,
                    message: formatMessage({ id: "form.validations.password" }),
                    min: 6,
                    required: true,
                  }
                ]
              })(<Input type="password" />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label={<FormattedMessage id="form.labels.password-confirmation" />}>
            {
              getFieldDecorator('passwordConfirmation', {
                rules: [
                  {
                    message: formatMessage({ id: "form.validations.required" }),
                    required: true,
                  },
                  {
                    validator: this.comparePasswords,
                  },
                ]
              })(<Input type="password" />)
            }
          </FormItem>
          <Submit />
        </Form>
      </Layout>
    </Authorized >)
  }
}

export default injectIntl(Form.create()(Widget))
