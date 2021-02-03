<template>
    <ul class="paginator">
        <li class="paginator__arrow" :class="{disabled : page <= 1}" ><a @click.prevent="page--" class="paginator-arrow prev" href="#"></a></li>
        <li v-for="num in pagesCnt" :key="num" >
            <a class="paginator__link" :class="{ active : num == page }" href="#" @click.prevent="page = num" >{{ num }}</a>
        </li>
        <li class="paginator__arrow" :class="{disabled : page >= pagesCnt}" ><a @click.prevent="page++" class="paginator-arrow next" href="#"></a></li>
    </ul>
</template>

<script>
export default {
    name: 'Pagination',
    props : {
        pagesCnt : {
            type : Number,
            default : 1,
        },
        value : {
            type : Number,
            default : 1,
        },
    },
    data : function () {
        return {
            page : 1,
        };
    },
    watch : {
        value : function (val, oldVal) {
            this.page = +val;
        },
        page : function (val, oldVal) {
            if (val < 1) {
                this.page = 1;
                return;
            }
            if (val > this.pagesCnt) {
                this.page = +this.pagesCnt;
                return;
            }
            this.$emit('input', this.page);
        },
        pagesCnt : function (val, oldVal) {
            this.page = 1;
        },
    },
}
</script>
