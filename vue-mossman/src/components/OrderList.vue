<template>
<div class="lc-body">
    <div class="lc__top">
        <div class="lc-select-cont">
            <form action="">
                <div class="lc-select">
                    <select v-model="filter.city" >
                        <option value="">Выбрать город</option>
                        <option v-for="(city, cityKey) in cities" :key="cityKey" >{{ city }}</option>
                    </select>
                </div>
                <div class="lc-select">
                    <select v-model="filter.type" >
                        <option value="">Выбрать тип</option>
                        <option v-for="(type, typeKey) in types" :key="typeKey" >{{ type }}</option>
                    </select>
                </div>
                <div class="lc-select">
                    <select v-model="filter.status" >
                        <option value="">Выбрать статус</option>
                        <option v-for="(status, statusKey) in statuses" :key="statusKey" >{{ status }}</option>
                    </select>
                </div>
                <div v-if="this.filterByUsers" class="lc-select">
                    <select v-model="filter.user" >
                        <option value="">Выбрать ответственного</option>
                        <option v-for="(user, userKey) in filterByUsers" :key="userKey" v-bind:value="user">{{ userKey }}</option>
                    </select>
                </div>
                <div class="lc-input">
                    <div class="info-tile">Номер заказа</div>
                    <input v-model="filter.orderNum" class="" />
                </div>
                <div class="lc-input">
                    <div class="info-tile">Номер счёта</div>
                    <input v-model="filter.invoiceNum" class="" />
                </div>
                <div class="lc-input">
                    <div class="info-tile">Внутренний номер</div>
                    <input v-model="filter.innerCode" class="" />
                </div>
            </form>
        </div>
        <a href="/lk/orders/?id=0" class="lc-request-create">Создать заказ</a>
    </div>
    <div class="lc-table">
        <div class="lc-table__list order-list">
            <div class="lc-table__head">
                <div class="lc-table__row">
                    <div class="lc-table__col col-number">Номер заказа</div>
                    <div class="lc-table__col col-date">Дата заказа</div>
                    <div class="lc-table__col col-city">Внутренний номер</div>
                    <div class="lc-table__col col-status">Статус</div>
                    <div class="lc-table__col col-btn"></div>
                </div>
            </div>
            <div v-for="item in items" :key="item.ID" class="lc-table__item order-item" :class="{ 'lc-table__item--unread-messages' : item.hasUnreadMessages, }" >
                <div class="lc-table__row">
                    <div class="lc-table__col col-number">
                        <div class="order-number title">Заказ №{{ item.UF_ORDER_NUM }}</div>
                    </div>
                    <div class="lc-table__col col-date"><span class="table__col-name">Дата заказа:</span>{{ item.UF_DATE_ADDED }}</div>
                    <div class="lc-table__col col-city"><span class="table__col-name">Внутренний номер:</span>{{ item.UF_INNER_CODE }}</div>
                    <div class="lc-table__col col-status"><span class="table__col-name">Статус:</span><div class="status ready">{{ item.UF_STATUS }}</div></div>
                    <div class="lc-table__col col-btn">
                        <a :href="`/lk/orders/?id=${item.ID}`" class="btn lc-btn">Подробнее</a>
                    </div>
                </div>
                <div class="lc-table__row">
                    <div class="lc-table__col col-info">
                        <div class="col-info-line" >
                            <div class="line-name-dop"><span class="line-name">Контрагент:</span> <b>{{ item.UF_CONTRACTOR }}</b></div>
                            <div class="line-name-dop-dop"><span class="line-name line-name-sum">Сумма счета: </span><b>{{ item.UF_INVOICE_SUM }}</b></div>
                        </div>
                        <div class="col-info-line" >
                            <div class="line-name-dop"><span class="line-name">Дата отгрузки:</span> <b>{{ item.UF_SHIPMENT_DATE }}</b></div>
                        </div>
                        <div class="col-info-line" >
                            <div class="line-name-dop"><span class="line-name">Ответственный:</span> <b>{{ item.UF_RESPONSIBLE_NAME }}</b></div>
                        </div>
                        <div v-if="item.UF_MODEL" class="col-info-line" >
                            <div class="line-name-dop"><span class="line-name">Модель:</span> <b>{{ item.UF_MODEL }}</b></div>
                            <div class="line-name-dop-dop"><span class="line-name line-name-paid">Сумма оплаты: </span><b>{{ item.UF_PAYED_SUM }}</b></div>
                        </div>
                        <div v-if="item.UF_INVOICE_NUM" class="col-info-line" >
                            <div class="line-name-dop"><span class="line-name">Счёт:</span> <b>№{{ item.UF_INVOICE_NUM }}</b> ({{ item.UF_INVOICE_DATE }})</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <pagination v-if="pagesCnt > 1" v-model="pageNum" :pages-cnt="pagesCnt" ></pagination>
    </div>
</div>
</template>

<script>

import pagerMixin from '../mixins/Pager.vue';

export default {
    name: 'OrderList',
    mounted () {
        this.loadData();
    },
    watch : {
        pageNum (val, oldVal) {
            this.loadData();
        },
        filter : {
            deep : true,
            handler () {
                clearTimeout(this.filterTimeout);
                this.filterTimeout = setTimeout(()=>{
                    this.loadData();
                },1000);
            },
        },
    },
    mixins : [
        pagerMixin,
    ],
    data : () => ({
        cities : [],
        types : [],
        statuses : [],
        items : [],
        filterTimeout : null,
        filterByUsers: [],
        filter : {
            city : '',
            type : '',
            status : '',
            orderNum : '',
            invoiceNum : '',
            innerCode : '',
            user : '',
        },
    }),
    methods : {
        loadData () {
            BX.ajax.runComponentAction('xpage:ajax', 'ordersGetList', {
                mode : 'class',
                data : {
                    filter : this.filter,
                    pageNum : this.pageNum,
                },
            }).then(response => {
                this.items = response.data.items || [];
                this.cities = response.data.cities || [];
                this.types = response.data.types || [];
                this.statuses = response.data.statuses || [];
                this.pagesCnt = +response.data.pagesCnt || 0;
                this.filterByUsers = response.data.filterByUsers || [];
            });
        },
    },
}
</script>
