<template>
<div class="lc-body">
    <a href="/lk/claims/" class="lk-back-link">Перейти в список запросов</a>
    <div v-if="dataLoaded" class="lc__info request-info">
        <div class="lc-card">
            <div class="lc-card-group">
                <div class="col-left">
                    <div class="lc-info-item">
                        <div class="info-tile">Номер запроса</div>
                        <div v-if="values.UF_NUM" class="info-input-group">
                            <span>{{ values.UF_NUM }} от {{ values.UF_DATE_ADDED }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-right">
                    <div class="lc-info-item">
                        <div class="info-tile">Дистрибьютер</div>
                        <select v-if="userData.distributors.length" v-model="values.UF_DISTRIBUTOR" required >
                            <option value="">Выберите из списка</option>
                            <option v-for="item in userData.distributors" :key="item.ID" >{{ item.UF_NAME }}</option>
                        </select>
                        <input v-else v-model="values.UF_DISTRIBUTOR" class="info-input" />
                    </div>
                </div>
            </div>
            <div class="lc-card-group">
                <div class="col-left">
                    <div class="lc-info-item">
                        <div class="info-tile">запрос</div>
                        <textarea v-model="values.UF_TEXT" class="info-input input-text" ></textarea>
                    </div>
                    <div class="lc-info-item">
                        <div class="info-tile">Файлы:</div>
                        <div class="">
                            <div class="">
                                <div class="">

                                </div>
                                <div class="default-input default-input--file" style="width: 200px;">
                                    <input class="default-input__input default-input__input--file" ref="OrderFiles" @change="fileInputChanged($event.target)" type="file" multiple id="price-file" />
                                    <div class="default-input__input-filetext" style="margin-bottom: 20px;">
                                        <input class="default-input__input" type="text" readonly="" placeholder="Прикрепить файл +">
                                        <label for="price-file" class="default-input__label--file"></label>
                                    </div>
                                    <div v-if="newFiles.length" >
                                        {{ Array.prototype.map.call(newFiles, file => file.name).join(', ') }}
                                    </div>
                                </div>
                                <div class="" style="margin-top: 20px;">
                                    Доступные форматы: jpg, png, gif, pdf, doc, docx, rtf, txt
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="files.length" class="lc-info-item">
                        <div class="info-tile">Загруженные файлы:</div>
                        <div class="">
                            <div v-for="file in files" :key="file.ID" class="">
                                <a :href="file.SRC" target="_blank" >{{ file.ORIGINAL_NAME }}</a>
                                <a v-if="!values.UF_RESPONSE" @click.prevent="fileRemove(file)" href="#" >удалить</a>
                            </div>
                        </div>
                    </div>
                    <div v-if="invoiceFiles.length" class="lc-info-item">
                        <div class="info-tile">Бланк счёта:</div>
                        <div class="">
                            <div v-for="file in invoiceFiles" :key="file.ID" class="">
                                <a :href="file.SRC" target="_blank" >{{ file.ORIGINAL_NAME }}</a>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- <div class="col-right">
                    <div class="lc-info-item">
                        <div class="info-tile">номер заказа</div>
                        <div class="info-input-group">
                            <div class="info-input"></div>
                            <span>от</span>
                            <div class="info-input input-date"></div>
                        </div>
                    </div>
                    <div class="lc-info-item">
                        <div class="info-tile">заказ</div>
                        <div class="info-input n-wr"></div>
                    </div>
                </div> -->
            </div>
        </div>
        <div v-if="values.UF_RESPONSE" class="lc-card request-answer">
            <div class="lc-info-item">
                <div class="info-tile">ответ</div>
                <div class="info-input-group answer-group">
                    <div class="col-left">
                        <div class="input-text" v-html='values.UF_RESPONSE.replace("\n", "<br/>")' ></div>
                    </div>
                    <div class="col-right">
                        <div class="answer-info">
                            <p v-if="values.UF_DATE_RESPONSE" >Дата ответа: <span n-wr>{{ values.UF_DATE_RESPONSE }}</span></p>
                            <p v-if="values.UF_ANSWER_NAME">Ответил: <span>{{ values.UF_ANSWER_NAME }}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button @click.prevent="save()" type="button" class="arrow-btn" name="save">Сохранить</button>
    </div>
</div>
</template>

<script>
export default {
    name : 'ClaimDetail',
    props : {
        id : {
            type : Number,
            default : 0,
        },
        userData : {
            type : Object,
            default : () => ({}),
        },
    },
    data : () => ({
        processed : false,
        claimId : 0,
        invoiceFiles : [],
        files : [],
        newFiles : [],
        values : {
            UF_NUM : '',
            UF_DATE_ADDED : '',
            UF_DISTRIBUTOR : '',
            UF_TEXT : '',
            UF_RESPONSE : '',
            UF_DATE_RESPONSE : '',
            UF_RESPONSIBLE_NAME : '',
            UF_ANSWER_NAME : '',
        },
        dataLoaded : false,
    }),
    mounted () {
        this.loadData()
            .then(() => {
                if (!this.values.UF_DISTRIBUTOR && this.userData.distributors.length) {
                    this.values.UF_DISTRIBUTOR = this.userData.distributors[0].UF_NAME;
                }
            });
        this.claimId = +this.id || 0;
    },
    methods : {
        fileInputChanged (input) {
            this.newFiles = this.$refs.OrderFiles.files;
        },
        loadData () {
            return new Promise((resolve, reject) => {
                BX.ajax.runComponentAction('xpage:ajax', 'claimGet', {
                    mode : 'class',
                    data : {
                        id : this.id,
                    },
                }).then(response => {
                    this.dataLoaded = true;
                    if (response.data) {
                        if (response.data.values) {
                            this.$set(this, 'values', response.data.values);
                        }
                        if (response.data.files) {
                            this.files = response.data.files;
                        }
                        if (response.data.invoiceFiles) {
                            this.invoiceFiles = response.data.invoiceFiles;
                        }
                    }
                    resolve();
                });
            });
        },
        fileRemove (file) {
            if (!file.ID) {
                return;
            }
            BX.ajax.runComponentAction('xpage:ajax', 'claimFileRemove', {
                mode : 'class',
                data : {
                    claimId : this.claimId,
                    fileId : file.ID,
                },
            }).then(response => {
                this.loadData();
            });
        },
        save () {
            if (this.processed) {
                return;
            }
            this.processed = true;
            let data = new FormData;
            data.append('id', this.claimId);
            data.append('values', JSON.stringify(this.values));
            if (this.newFiles.length) {
                for (var i = 0; i < this.newFiles.length; i++) {
                    data.append('files[]', this.newFiles[i]);
                }
            }
            BX.ajax.runComponentAction('xpage:ajax', 'claimSave', {
                mode : 'class',
                data,
            }).then(response => {
                this.$refs.OrderFiles.value = '';
                this.newFiles = [];
                if (response.data && +response.data.id) {
                    if (this.claimId != +response.data.id) {
                        this.claimId = +response.data.id;
                        history.pushState({}, '', `${location.pathname}?id=${this.claimId}`);
                    }
                }
                this.loadData();
                this.processed = false;
            });
        },
    },
}
</script>
