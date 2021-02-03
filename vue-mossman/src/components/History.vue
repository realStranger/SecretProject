<template>
    <div class="lc-body">
        <div class="lc__top">
            <div class="lc-select-cont">
                <form action="">
                    <div class="lc-select">
                        <select id="specialist">
                            <option value="spec-0">Выбрать специалиста</option>
                            <option value="spec-1">Андрей Андреев</option>
                            <option value="spec-2">Дизайнер</option>
                        </select>
                    </div>
                </form>
            </div>
        </div>
        <div class="lc-history">
            <div class="lc-history__list">
                <div v-for="item in items" :key="item.ID" class="lc-history__item">
                    <div class="lc-history__title">
                        {{ item.USER_PROFESSION }} <a href="#">{{ [ item.USER_SECOND_NAME, item.USER_NAME, item.USER_LAST_NAME ].filter(v=>v).join(' ') }}</a> {{ item.ACTION }}
                        <a v-if="item.SOURCE" href="#"></a>
                        <span v-else >{{ item.UF_SOURCE_NAME || item.UF_SOURCE_ID }}</span>
                    </div>
                    <div class="lc-history__date">{{ item.UF_DATETIME }}</div>
                </div>
            </div>
            <pagination v-if="pagesCnt > 1" v-model="pageNum" :pages-cnt="pagesCnt" ></pagination>
        </div>
    </div>
</template>

<script>
import pagerMixin from '../mixins/Pager.vue';

export default {
    name : 'History',
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
            BX.ajax.runComponentAction('xpage:ajax', 'historyGetList', {
                mode : 'class',
                data : {
                    pageNum : this.pageNum,
                },
            }).then(response => {
                this.items = response.data.items || [];
            });
        },
    },
}
</script>
