<template>
<div class="lc-body">
    <div class="lc__top">
        <a href="/lk/claims/?id=0" class="lc-request-create">Создать запрос</a>
    </div>
    <div class="lc-table">
        <div class="lc-table__list request-list">
            <div class="lc-table__head">
                <div class="lc-table__row">
                    <div class="lc-table__col col-number">Номер запроса</div>
                    <div class="lc-table__col col-date">Дата запроса</div>
                    <div class="lc-table__col col-responsible">Ответственный</div>
                    <div class="lc-table__col col-date-2">Дата ответа</div>
                    <div class="lc-table__col col-btn"></div>
                </div>
            </div>
            <div v-for="item in items" :key="item.ID" class="lc-table__item request-item" :class="{ 'lc-table__item--unread-messages' : item.hasUnreadMessages, }" >
                <div class="lc-table__row">
                    <div class="lc-table__col col-number">
                        <div class="request-number title">Запрос №{{ item.UF_NUM }}</div>
                    </div>
                    <div class="lc-table__col col-date"><span class="table__col-name">Дата запроса:</span>{{ item.UF_DATE_ADDED }}</div>
                    <div class="lc-table__col col-responsible"><span class="table__col-name">Ответственный:</span>{{ item.UF_RESPONSIBLE_NAME }}</div>
                    <div class="lc-table__col col-date-2"><span class="table__col-name">Дата ответа:</span>{{ item.UF_DATE_RESPONSE }}</div>
                    <div class="lc-table__col col-btn">
                        <a :href="`/lk/claims/?id=${item.ID}`" class="btn lc-btn">Подробнее</a>
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
    name: 'ClaimList',
    mounted () {
        this.loadData();
    },
    watch : {
        pageNum (val, oldVal) {
            this.loadData();
        },
    },
    mixins : [
        pagerMixin,
    ],
    data : () => ({
        items : [],
    }),
    methods : {
        loadData () {
            BX.ajax.runComponentAction('xpage:ajax', 'claimsGetList', {
                mode : 'class',
                data : {
                    pageNum : this.pageNum,
                },
            }).then(response => {
                this.items = response.data.items || [];
                this.pagesCnt = +response.data.pagesCnt || 0;
            });
        },
    },
}
</script>
