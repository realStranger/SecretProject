import Vue from 'vue';
// Vue.config.productionTip = false

Vue.component('order-list', () => import('./components/OrderList.vue'));
Vue.component('order-detail', () => import('./components/OrderDetail.vue'));
Vue.component('editable', () => import('./components/Editable.vue'));
Vue.component('claim-list', () => import('./components/ClaimList.vue'));
Vue.component('claim-detail', () => import('./components/ClaimDetail.vue'));
Vue.component('documents', () => import('./components/Documents.vue'));
Vue.component('history', () => import('./components/History.vue'));
Vue.component('pagination', () => import('./components/Pagination.vue'));
Vue.component('chat', () => import('./components/Chat.vue'));

document.addEventListener('DOMContentLoaded', () => {
    window.app = new Vue({
        el : '.app',
        data : {
            inputmaskDate : new Inputmask('99.99.9999'),
        },
        mounted () {
            $(document).on('focus', 'input.mask--date', e => {
                this.inputmaskDate.mask(e.target);
            });

            // lc dropdown-menu
            $(document).on('click', '.lc-doc__menu .toggle-dropdown', function(){
                $(this).siblings('.dropdown').slideToggle();
            });

            $(document).on('click', '.lc__top .select .label', function(){
                $(this).siblings('.dropdown').slideToggle();
            });

        },
    });
});
