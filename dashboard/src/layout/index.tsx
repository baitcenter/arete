import HeaderSearch from 'ant-design-pro/lib/HeaderSearch'
import { Icon, Layout, Menu, message, Modal } from 'antd'
import { ClickParam } from 'antd/lib/menu'
import * as React from 'react'
import { FormattedMessage, InjectedIntlProps, injectIntl, intlShape } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from "react-router"
import { Dispatch } from 'redux'

import { ISiteState, IUserState, siteRefresh, userSignIn, userSignOut } from '../actions'
import { set as setLocale } from '../intl'
import { IApplicationState } from '../reducers'
import { httpDelete, httpGet } from '../utils/request'
import { get as getToken } from '../utils/token'
import Footer from './Footer'

const { Header, Sider, Content } = Layout

interface IProps {
  children: React.ReactNode,
  user: IUserState,
  site: ISiteState,
  refresh: typeof siteRefresh,
  signIn: typeof userSignIn,
  signOut: typeof userSignOut,
}

interface IState {
  collapsed: boolean,
}

interface IMenu {
  key: string,
  label: React.ReactNode,
  icon: string,
  children: IMenuItem[],
}
interface IMenuItem {
  key: string,
  label: React.ReactNode,
}

interface INavItem {
  children: React.ReactNode,
  key: string,
}

function headerBar(user: IUserState): INavItem[] {
  const items = [{
    children: (<Icon type="home" />),
    key: 'home',
  }]
  if (user.uid) {
    items.push({
      children: (<Icon type="dashboard" />),
      key: "dashboard",
    })
  }
  items.push({
    children: (<HeaderSearch />),
    key: "search",
  })
  items.push({
    children: (<Icon type="reload" />),
    key: "reload",
  })
  items.push({
    children: (<Icon type="question-circle-o" />),
    key: "doc",
  })
  if (user.uid) {
    items.push({
      children: (<Icon type="logout" />),
      key: "sign-out",
    })
  } else {
    items.push({
      children: (<Icon type="login" />),
      key: "to-/users/sign-in",
    })
  }
  return items.reverse()
}

function siderBar(user: IUserState): IMenu[] {
  return []
}


class Widget extends React.Component<RouteComponentProps<any> & InjectedIntlProps & IProps, IState> {
  public static propTypes: React.ValidationMap<any> = {
    intl: intlShape.isRequired,
  }
  constructor(props: RouteComponentProps<any> & InjectedIntlProps & IProps) {
    super(props)
    this.state = {
      collapsed: false,
    }
  }
  public handleMenuItem = (e: ClickParam) => {
    const { history, intl, signOut } = this.props
    const key = e.key

    const to = 'to-'
    if (key.startsWith(to)) {
      history.push(key.substring(to.length))
      return
    }

    const lang = 'lang-'
    if (key.startsWith(lang)) {
      setLocale(key.substring(lang.length))
      window.location.reload()
      return
    }

    switch (key) {
      case 'home':
        window.open('/', '_blank')
        return
      case 'dashboard':
        history.push('/')
        return
      case 'doc':
        window.open('https://github.com/saturn-xiv/arete/issues', '_blank')
        return
      case 'reload':
        window.location.reload()
        return
      case 'toggle':
        this.setState({
          collapsed: !this.state.collapsed
        })
        return
      case 'search':
        return
      case 'sign-out':
        Modal.confirm({
          title: intl.formatMessage({ id: 'nut.users.sign-out.sure' }),
          onOk() {
            httpDelete('/users/sign-out')
              .then(() => message.success(intl.formatMessage({ id: 'flashes.success' })))
              .catch(message.error)
            signOut()
          }
        });
        return
      default:
        window.console.log(key)
    }
  }
  public componentDidMount() {
    httpGet(`/about`).then((rst) => {
      this.props.refresh(rst)
    }).catch(message.error)

    const token = getToken()
    if (token) {
      this.props.signIn(token)
    }
  }
  public render() {
    return (<Layout>
      <Sider breakpoint="lg" collapsedWidth="0" trigger={null} collapsible={true} collapsed={this.state.collapsed}>
        <div className="sider-logo" />
        <Menu onClick={this.handleMenuItem} theme="dark" mode="inline" defaultSelectedKeys={[]}>
          {
            siderBar(this.props.user).map((it) => (<Menu.SubMenu
              key={it.key}
              title={(<span><Icon type={it.icon} />{it.label}</span>)}>
              {it.children.map((jt) => (<Menu.Item key={jt.key}>{jt.label}</Menu.Item>))}
            </Menu.SubMenu>))
          }
        </Menu>
      </Sider>
      <Layout>
        <Header className="header-bar">
          <Menu onClick={this.handleMenuItem} mode="horizontal">
            <Menu.Item key='toggle'>
              <Icon className="trigger" type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'} />
            </Menu.Item>
            {
              headerBar(this.props.user).map((it) => (<Menu.Item
                className="pull-right"
                key={it.key}>
                {it.children}
              </Menu.Item>))
            }
            <Menu.SubMenu className="pull-right" key="switch-languages" title={<Icon type="global" />}>
              {
                this.props.site.languages.map((it) => (<Menu.Item key={`lang-${it}`}>
                  <FormattedMessage id={`languages.${it}`} />
                </Menu.Item>))
              }
            </Menu.SubMenu>
          </Menu>
        </Header>
        <Content className="root-content">
          {this.props.children}
        </Content>
        <Footer />
      </Layout>
    </Layout>)
  }
}

const mapStateToProps = ({ site, user }: IApplicationState) => ({
  site,
  user,
})


const mapDispatchToProps = (dispatch: Dispatch) => ({
  refresh: (info: ISiteState) => dispatch(siteRefresh(info)),
  signIn: (token: string) => dispatch(userSignIn(token)),
  signOut: () => dispatch(userSignOut()),
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Widget)))
