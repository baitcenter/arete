import Vue from 'vue'
import Moment from 'vue-moment'
import Vuetify from 'vuetify'
import VeeValidate from 'vee-validate'

import Notification from './Notification'
import FileList from './FileList'

Vue.use(VeeValidate)
Vue.use(Moment)
Vue.use(Vuetify, {
    iconfont: 'md'
})

Vue.component('notification-bar', Notification)
Vue.component('file-list', FileList)