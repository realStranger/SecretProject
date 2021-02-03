<template>
<div class="lc-body">
    <input style="display: none;" ref="inputFile" @change="fileChanged($event)" type="file" name="file" multiple />
    <a style="display: none;" ref="link" target="_blank" href="#"></a>
    <div class="lc__top">
        <div class="lc-search-cont">
            <form @submit.prevent="applySearch()" action="">
                <div class="lc-search">
                    <input v-model="search" type="text" placeholder="Поиск"/>
                    <input type="submit" value="Найти"/>
                </div>
            </form>
        </div>
        <div class="select">
            <div class="label">Добавить</div>
            <div class="dropdown">
                <ul>
                    <li><a @click.prevent="addDirectory()" href="#"><span class="icon"><img src="/local/templates/mossman2018/img/ico-doc-1.svg" alt=""></span>Создать папку</a></li>
                    <li><a @click.prevent="addFiles()" href="#"><span class="icon"><img src="/local/templates/mossman2018/img/ico-doc-2.svg" alt=""></span>Загрузить файлы</a></li>
                </ul>
            </div>
        </div>
    </div>
    <div class="lc-doc">
        <div class="lc-doc__list">
            <div v-if="+sectionId" class="lc-doc__item">
                <a @click.prevent="up()" href="#">..</a>
            </div>
            <div v-for="item in items" :key="item.ID" class="lc-doc__item">
                <div  class="lc-doc__menu">
                    <div class="toggle-dropdown"></div>
                    <div class="dropdown">
                        <ul>
                            <li><a href="#" @click.prevent="open(item)" >Открыть</a></li>
                            <li><a href="#" @click.prevent="rename(item)" >Переименовать</a></li>
                            <li><a href="#" @click.prevent="remove(item)" >Удалить</a></li>
                            <!-- <li><a href="#">Копировать</a></li>
                            <li><a href="#">Переместить</a></li> -->
                        </ul>
                    </div>
                </div>
                <template v-if="!+item.UF_FILE" >
                    <div class="lc-doc__ico" style="background-image: url('/local/templates/mossman2018/img/ico-folder.svg')"></div>
                </template>
                <div class="lc-doc__title" :class="[ `lc-doc__title--${item.ID}`, ]" >
                    <input v-model="item.UF_NAME" type="text" :readonly="renameItemId != item.ID" @blur="renameItemId ? save(item, 'UF_NAME') : false" @keyup.enter="save(item, 'UF_NAME');" @dblclick="open(item)" />
                </div>
                <div class="lc-doc__date">{{ item.UF_DATETIME }}</div>
            </div>
        </div>
        <pagination v-if="pagesCnt > 1" v-model="pageNum" :pages-cnt="pagesCnt" ></pagination>
    </div>
</div>
</template>

<script>

import pagerMixin from '../mixins/Pager.vue';

export default {
    name : 'Documents',
    mounted () {
        this.loadData();
    },
    mixins : [
        pagerMixin,
    ],
    data : () => ({
        search : '',
        sectionId : 0,
        parentSectionId : 0,
        renameItemId : 0,
        items : [],
    }),
    watch : {
        sectionId (val, oldVal) {
            this.loadData();
        },
        pageNum (val, oldVal) {
            this.loadData();
        },
        renameItemId (val, oldVal) {
            if (+val) {
                setTimeout(()=>{
                    this.$el.querySelector(`.lc-doc__title--${val} input[type="text"]`).focus();
                    // this.$el.querySelector(`.lc-doc__title--${val} input[type="text"]`).select();
                    this.$el.querySelector(`.lc-doc__title--${val} input[type="text"]`).setSelectionRange(
                        this.$el.querySelector(`.lc-doc__title--${val} input[type="text"]`).value.length,
                        this.$el.querySelector(`.lc-doc__title--${val} input[type="text"]`).value.length,
                        'forward'
                    );
                }, 300);
            }
        },
    },
    methods : {
        applySearch () {
            this.loadData(this.search);
        },
        loadData (search = '') {
            if (!search) {
                this.search = '';
            }
            BX.ajax.runComponentAction('xpage:ajax', 'documentsGetList', {
                mode : 'class',
                data : {
                    sectionId : this.sectionId,
                    pageNum : this.pageNum,
                    search,
                },
            }).then(response => {
                this.items = response.data.items || [];
                this.parentSectionId = response.data.parentSectionId || 0;
                this.pagesCnt = +response.data.pagesCnt || 0;
            });
        },
        up () {
            this.sectionId = this.parentSectionId;
        },
        open (item) {
            $(this.$el).find('.dropdown').slideUp();
            if (item.fileSrc) {
                this.$refs.link.href = item.fileSrc;
                this.$refs.link.click();
            }
            else {
                this.sectionId = item.ID;
            }
        },
        rename (item) {
            this.renameItemId = item.ID;
            $(this.$el).find('.dropdown').slideUp();
        },
        remove (item) {
            $(this.$el).find('.dropdown').slideUp();
            BX.ajax.runComponentAction('xpage:ajax', 'documentRemove', {
                mode : 'class',
                data : {
                    id : item.ID,
                },
            }).then(response => {
                this.loadData();
            });
        },
        addDirectory (item) {
            $(this.$el).find('.dropdown').slideUp();
            BX.ajax.runComponentAction('xpage:ajax', 'addDirectory', {
                mode : 'class',
                data : {
                    parentSectionId : this.sectionId,
                },
            }).then(response => {
                this.loadData();
            });
        },
        addFiles () {
            this.$refs.inputFile.click();
            $(this.$el).find('.dropdown').slideUp();
        },
        fileChanged (e) {
            let files = [];
            try {
                for (var i = 0; i < e.target.files.length; i++) {
                    files.push(e.target.files[i]);
                }
            } catch (e) {
                console.log(e);
            }
            if (files.length) {
                this.uploadFiles(files);
            }
        },
        uploadFiles (files = []) {
            let data = new FormData;
            data.append('sectionId', this.sectionId);
            for (var i = 0; i < files.length; i++) {
                data.append('file[]', files[i]);
            }
            BX.ajax.runComponentAction('xpage:ajax', 'addFiles', {
                mode : 'class',
                data,
            }).then(response => {
                this.$refs.inputFile.value = '';
                this.loadData();
            });
        },
        save (item, field = '') {
            let values;
            if (field) {
                if (item[field]) {
                    values = {};
                    values[field] = item[field];
                }
            }
            else {
                values = item;
            }
            BX.ajax.runComponentAction('xpage:ajax', 'documentSave', {
                mode : 'class',
                data : {
                    id : item.ID,
                    values,
                },
            }).then(response => {
                this.renameItemId = '';
                this.loadData();
            });
        },
    },
}
</script>
