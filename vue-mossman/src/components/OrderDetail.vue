<template>
    <div v-if="dataLoaded" class="lc-body">
        <form @submit.prevent="save()" method="post" >
            <a href="/lk/orders/" class="lk-back-link">Перейти в список заказов</a>
            <div class="lc__top lc-info-top">
                <div class="order-top-info info-item-group">
                    <div class="lc-info-item">
                        <div class="info-tile">Вид заказа</div>
                        <select v-model="values.UF_TYPE" required >
                            <option value="">Выберите из списка</option>
                            <option>Первичный</option>
                            <option>Вторичный</option>
                            <option>Рекламация</option>
                        </select>
                    </div>
                    <div class="lc-info-item">
                        <div class="info-tile">Контрагент/ юр. лицо</div>
                        <select v-if="userData.distributors.length" v-model="values.UF_CONTRACTOR_CODE" required >
                            <option value="">Выберите из списка</option>
                            <option v-for="item in userData.distributors" :key="item.ID" :value="item.UF_CODE" >{{ item.UF_NAME }}</option>
                        </select>
                        <input v-else v-model="values.UF_CONTRACTOR" class="info-input w-max" />
                    </div>
                    <div class="lc-info-item">
                        <div class="info-tile">Внутренний номер</div>
                        <input v-model="values.UF_INNER_CODE" class="info-input w-max" />
                    </div>
                </div>
                <div class="lc__top-status during"><span class="icon"><img src="/local/templates/mossman2018/img/ico-during.svg" alt=""></span> {{ values.UF_STATUS }}</div>
            </div>
            <div class="lc__info order-info">
                <div class="col-left">
                    <div class="title">Информация по клиенту</div>
                    <div class="lc-card">
                        <div v-if="values.UF_TYPE && values.UF_TYPE != 'Первичный'" class="lc-info-item">
                            <div class="info-tile">Первичный заказ:</div>
                            <select @change="primaryOrder =''" v-model="sortType">
                                <option value="Заказ">Поиск по номеру заказа</option>
                                <option value="Счет">Поиск по номеру счета</option>
                            </select>
                            <div v-if="sortType == 'Заказ'" class="primary-orders-select">
                                <input type="text" class="primary-orders" @change="takeDataCode" list="primary-orders" v-model="primaryOrder" placeholder="Выберите из списка">
                                <datalist id="primary-orders">
                                    <option v-for="item in ordersList.filter(o=>o.ID != orderId)" :key="item.ID" :data-order="item.UF_CODE" >№{{ item.UF_ORDER_NUM }}</option>
                                </datalist>
                            </div>
                            <div v-else class="primary-orders-select">
                                <input type="text" class="primary-orders" @change="takeDataCode" list="primary-orders" v-model="primaryOrder" placeholder="Выберите из списка">
                                <datalist id="primary-orders">
                                    <option v-for="item in ordersList.filter(o=>o.ID != orderId)" :key="item.ID" :data-order="item.UF_CODE" >№{{ item.UF_INVOICE_NUM }}</option>
                                </datalist>
                            </div>
                        </div>
                        <div class="lc-info-item">
                            <div class="string-item">
                                <div class="info-tile">3Cad сервер №</div>
                                <div class="info-input-group">
                                    <input v-model="values.UF_3CAD_SERVER_NUM_NEW" class="info-input w-min" />
                                    <span>от</span>
                                    <input  @keyup="values.UF_3CAD_SERVER_DATE = $event.target.value" v-model="values.UF_3CAD_SERVER_DATE" class="info-input w-min mask--date" />
                                </div>
                            </div>
                        </div>
                        <div class="lc-info-item">
                            <div class="info-tile">Модель:</div>
                            <input v-model="values.UF_MODEL" class="info-input w-max" />
                        </div>
                        <div class="lc-info-item">
                            <div class="info-tile">Список товаров:</div>
                            <div class="info-table table-wrap">
                                <table class="lc__info-table">
                                    <thead>
                                        <tr>
                                            <th>Артикул</th>
                                            <th>Название</th>
                                            <th>Кол-во</th>
                                            <th>Цена</th>
                                            <th>Сумма</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(orderProduct, key) in orderProducts" :key="orderProduct.ID" >
                                            <td class="n-wr">{{ orderProduct.UF_ARTICLE }}</td>
                                            <td>
                                                <template v-if="orderProduct.editable" >
                                                    <input class="name-input" v-model="orderProduct.UF_NAME" @input="searchProducts(orderProduct)" @change="productSelect(orderProduct)" :list="`product-list-${orderProduct.ID}`">
                                                    <datalist :id="`product-list-${orderProduct.ID}`">
                                                        <option v-for="variant in orderProduct.variants" :key="variant.ID" :value="variant.UF_NAME" ></option>
                                                    </datalist>
                                                    <div class="n-wr__save">
                                                        <a class="arrow-btn arrow-btn--small" href="#" @click.prevent="productSave(orderProduct)" >Сохранить</a>
                                                    </div>
                                                </template>
                                                <template v-else >
                                                    {{ orderProduct.UF_NAME }}

                                                    <div class="n-wr__edit">
                                                        <a class="arrow-btn arrow-btn--small" href="#" @click.prevent="orderProduct.editable = true" >Редактировать</a>
                                                    </div>
                                                </template>
                                                <div class="n-wr__remove">
                                                    <a class="arrow-btn arrow-btn--small" href="#" @click.prevent="orderProducts.splice(key, 1)" >Удалить</a>
                                                </div>
                                            </td>
                                            <td class="n-wr">
                                                <template v-if="orderProduct.editable" >
                                                    <input class="count-input" v-model="orderProduct.UF_QUANTITY" type="text" @input="recalcProductSum(orderProduct)" />
                                                </template>
                                                <template v-else >
                                                    {{ orderProduct.UF_QUANTITY }} шт
                                                </template>
                                            </td>
                                            <td class="n-wr">
                                                <template v-if="orderProduct.editable" >
                                                    <input class="price-input" v-model="orderProduct.UF_PRICE" type="text" @input="recalcProductSum(orderProduct)" />
                                                </template>
                                                <template v-else >
                                                    {{ orderProduct.UF_PRICE }} руб.
                                                </template>
                                            </td>
                                            <td class="n-wr">
                                                <!-- <template v-if="orderProduct.editable" >
                                                    <input class="summ-input" v-model="orderProduct.UF_SUM" type="text" />
                                                </template>
                                                <template v-else >
                                                    {{ orderProduct.UF_SUM }} руб.
                                                </template> -->
                                                <template v-if="orderProduct.UF_SUM" >
                                                    {{ orderProduct.UF_SUM }} руб.
                                                </template>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="lc-info-item__add">
                                    <a @click.prevent="addProduct()" class="arrow-btn arrow-btn--small" href="#">Добавить</a>
                                </div>
                            </div>
                        </div>
                        <!-- <div class="lc-info-item">
                            <div class="info-tile">Адрес отгрузки:</div>
                            <input v-model="values.UF_SHIPMENT_ADDRESS" class="info-input w-min" />
                        </div>
                        <div class="lc-info-item">
                            <div class="info-tile">Транспортная компания:</div>
                            <input v-model="values.UF_TRANSPORT_COMPANY" class="info-input w-min" />
                        </div> -->
                        <div class="lc-info-item">
                            <div class="info-tile">Комментарий:</div>
                            <input v-model="values.UF_COMMENT" class="info-input w-max" />
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
                                        <div v-if="orderFiles.length" >
                                            {{ Array.prototype.map.call(orderFiles, orderFile => orderFile.name).join(', ') }}
                                        </div>
                                    </div>
                                    <div class="" style="margin-top: 20px;">
                                        Доступные форматы: jpg, png, gif, pdf, doc, docx, rtf, txt
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="values.files && values.files.length" class="lc-info-item">
                            <div class="info-tile">Загруженные файлы:</div>
                            <div class="">
                                <div v-for="file in values.files" :key="file.ID" class="">
                                    <a :href="file.SRC" target="_blank" >{{ file.ORIGINAL_NAME }}</a>
                                    <a @click.prevent="fileRemove(file)" class="delete-file-order" href="#" >удалить</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-right">
                    <div class="title">Информация по заказу</div>
                    <div class="lc-card">
                        <div class="info-item-group">
                            <div class="lc-info-item b-item">
                                <div class="info-tile">Заказ фабрики:</div>
                                <div class="info-input" >{{ values.UF_FACTORY_TITLE }}</div>
                            </div>
                            <div class="lc-info-item">
                                <div class="info-tile">сумма:</div>
                                <div class="info-input w-min total" >{{ values.UF_SUM }}</div>
                            </div>
                        </div>
                        <div class="lc-info-item item-wrap">
                            <div v-if="+values.UF_CANCELED" class="string-item">
                                <div class="info-tile">Аннулирован</div>
                            </div>
                            <div v-if="+values.UF_PAUSED" class="string-item">
                                <div class="info-tile">Приостановлен</div>
                            </div>
                            <div v-if="values.UF_ACCEPTED_MANAGER" class="string-item">
                                <div class="info-tile">Принят менеджером:</div>
                                <div class="info-input-group">
                                    <div class="info-input w-min" >{{ values.UF_ACCEPT_MNGR_DATE }}</div>
                                    <span>{{ values.UF_ACCEPTED_MANAGER }}</span>
                                </div>
                            </div>
                            <div class="string-item">
                                <div class="info-tile">Обработан менеджером:</div>
                                <div class="info-input-group">
                                    <div class="info-input w-min" >{{ values.UF_PROCES_MNGR_DATE }}</div>
                                    <span>{{ values.UF_PROCESSED_MANAGER }}</span>
                                </div>
                            </div>
                            <div class="string-item">
                                <div class="info-tile">Обработан технологом:</div>
                                <div class="info-input-group">
                                    <div class="info-input w-min" >{{ values.UF_PROCESS_TECH_DATE }}</div>
                                    <span>{{ values.UF_PROCESSED_TECH }}</span>
                                </div>
                            </div>
                            <div class="string-item">
                                <div class="info-tile">Выставлен счет №</div>
                                <div class="info-input-group">
                                    <div class="info-input w-min" >{{ values.UF_INVOICE_NUM }}</div>
                                    <div class="info-input w-min" >{{ values.UF_INVOICE_DATE }}</div>
                                    <div class="info-input w-min total" >{{ values.UF_INVOICE_SUM }}</div>
                                    <span>{{ values.UF_INVOICE_NAME }}</span>
                                </div>
                            </div>
                            <div v-if="values.invoiceFile && values.invoiceFile.length" class="string-item">
                                <div class="info-tile">Бланк счёта</div>
                                <div class="info-input-group">
                                    <div v-for="f in values.invoiceFile" :key="f.ID" >
                                        <a :href="f.SRC" download >{{ f.ORIGINAL_NAME }}</a>
                                    </div>
                                </div>
                            </div>
                            <div class="string-item">
                                <div class="info-tile">оплачено:</div>
                                <div class="info-input-group">
                                    <div class="info-input w-min paid" >{{ values.UF_PAYED_SUM }}</div>
                                    <!-- <span class="color-text">Частичная оплата</span> -->
                                </div>
                            </div>
                            <div class="string-item">
                                <div class="info-tile">Счет принят:</div>
                                <div class="info-input-group">
                                    <input @keyup="values.UF_INVOICE_ACPT_DATE = $event.target.value" v-model="values.UF_INVOICE_ACPT_DATE" type="text" class="info-input mask--date w-min" />
                                    <span>{{ values.UF_INVOICE_ACPT_NAME }}</span>
                                    <a href="#" @click.prevent="values.UF_INVOICE_ACPT_DATE = (values.UF_INVOICE_ACPT_DATE?'':curDate)" class="arrow-btn" >{{ !values.UF_INVOICE_ACPT_DATE?'Принять счёт':'Отменить приёмку счёта' }}</a>
                                </div>
                            </div>
                            <div class="string-item">
                                <div class="info-tile">Выписаны бух. документы:</div>
                                <div class="info-input-group">
                                    <div class="info-input w-min" >{{ values.UF_ACCOUNTING_DATE }}</div>
                                    <span>{{ values.UF_ACCOUNTING_NAME }}</span>
                                </div>
                            </div>
                            <div class="string-item">
                                <div class="info-tile color-text-2">Плановая дата готовности:</div>
                                <div class="info-input-group">
                                    <div class="info-input w-min color-text-2" >{{ values.UF_PLAN_DATE }}</div>
                                    <!-- <span>Срок исполнения — 40 рабочих дней от 26.12.2018</span> -->
                                </div>
                            </div>
                            <div class="string-item">
                                <div class="info-tile">Ответственный:</div>
                                <div class="info-input-group">
                                    <div class="info-input b-input" >{{ values.UF_RESPONSIBLE_NAME }}</div>
                                </div>
                            </div>
                            <div class="string-item">
                                <div class="info-tile">Телефон:</div>
                                <div class="info-input-group">
                                    <div class="info-input b-input" >{{ values.UF_RESPONSIBLE_PHONE }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button type="submit" class="arrow-btn" name="save" value="save" >Сохранить</button>
            <button v-if="orderId && !+values.UF_CANCELED" @click.prevent.stop="pauseToggle()" type="button" class="arrow-btn" name="save">{{ !values.UF_PAUSED ? 'Приостановить' : 'Возобновить' }}</button>
            <button v-if="orderId && !+values.UF_CANCELED" @click.prevent.stop="cancel()" type="button" class="arrow-btn" name="save">Аннулировать</button>

        </form>
    </div>
</template>

<script>
import moment from 'moment';
moment.locale('ru');
export default {
    name: 'OrderDetail',
    props : {
        id : {
            type : Number,
            default : 0,
        },
        userData : {
            type : Object,
            default : () => ({}),
        },
        ordersList : {
            type : Array,
            default : () => ([]),
        },
    },
    mounted () {
        $(()=>{
            this.curDate = moment().format('DD.MM.YYYY');
        });
        this.orderId = +this.id;
        if (this.orderId) {
            this.loadData();
        }
        else {
            if (this.userData.distributors.length) {
                this.values.UF_CONTRACTOR = this.userData.distributors[0].UF_NAME;
            }
            if (this.userData.distributors.length) {
                this.values.UF_CONTRACTOR_CODE = this.userData.distributors[0].UF_CODE;
            }
            this.dataLoaded = true;
        }
    },
    data : () => ({
        curDate : '',
        processed : false,
        orderId : 0,
        values : {
            UF_TYPE : '',
            UF_CONTRACTOR : '',
            UF_PRIMARY_ORDER : '',
            UF_3CAD_SERVER_NUM : '',
            UF_3CAD_SERVER_DATE : '',
            UF_MODEL : '',
            UF_SHIPMENT_ADDRESS : '',
            UF_TRANSPORT_COMPANY : '',
            UF_COMMENT : '',
            UF_FACTORY_TITLE : '',
            UF_SUM : '',
            UF_ACCEPT_MNGR_DATE : '',
            UF_PROCES_MNGR_DATE : '',
            UF_PROCESS_TECH_DATE : '',
            UF_INVOICE_NUM : '',
            UF_INVOICE_DATE : '',
            UF_INVOICE_SUM : '',
            UF_INVOICE_ACPT_DATE : '',
            UF_ACCOUNTING_DATE : '',
            UF_PLAN_DATE : '',
            UF_RESPONSIBLE_NAME : '',
            UF_RESPONSIBLE_PHONE : '',
            UF_STATUS : '',
            UF_ACCEPTED_MANAGER : '',
            UF_PROCESSED_MANAGER : '',
            UF_PROCESSED_TECH : '',
            UF_INVOICE_NAME : '',
            UF_INVOICE_ACPT_NAME : '',
            UF_ACCOUNTING_NAME : '',
            UF_CONTRACTOR_CODE : '',
            UF_INNER_CODE : '',
            UF_3CAD_SERVER_NUM_NEW : '',
            UF_CANCELED : 0,
            UF_PAUSED : 0,
        },
        orderProducts : [],
        dataLoaded : false,
        searchTimeout : null,
        orderFiles : [],
        primaryOrder: '',
        sortType: 'Заказ',
    }),
    computed : {
        contractorCode () {
            return this.values.UF_CONTRACTOR_CODE;
        },
    },
    watch : {
        contractorCode (code) {
            if (code) {
                let distributor = this.userData.distributors.find(o => o.UF_CODE == code);
                if (distributor) {
                    this.values.UF_CONTRACTOR = distributor.UF_NAME;
                }
                else {
                    this.values.UF_CONTRACTOR = '';
                }
            }
            else {
                this.values.UF_CONTRACTOR = '';
            }
        },
    },
    methods : {
        recalcProductSum (product) {
            console.log(product.UF_QUANTITY);
            if(product.UF_QUANTITY.includes(',')) {
                product.UF_QUANTITY = product.UF_QUANTITY.replace(',', '.');
            }
            let sum = +product.UF_PRICE * +product.UF_QUANTITY;
            sum = sum.toFixed(2);
            product.UF_SUM = sum;
        },
        productSelect (product) {
            if (product.variants && product.variants.length) {
                let similar = product.variants.filter(variant => variant.UF_NAME == product.UF_NAME);
                if (similar.length == 1) {
                    product.UF_PRODUCT_CODE = similar[0].UF_CODE;
                    product.UF_ARTICLE = similar[0].UF_ARTICLE;
                    if (!product.UF_PRICE) {
                        product.UF_PRICE = similar[0].UF_PRICE;
                    }
                }
            }
        },
        productSave (product) {
            this.productSelect(product);
            product.editable = false;
        },
        cancel () {
            BX.ajax.runComponentAction('xpage:ajax', 'orderCancel', {
                mode : 'class',
                data : {
                    orderId : this.orderId,
                },
            }).then(response => {
                this.loadData();
            });
        },
        pauseToggle () {
            BX.ajax.runComponentAction('xpage:ajax', 'orderPause', {
                mode : 'class',
                data : {
                    orderId : this.orderId,
                    paused : +this.values.UF_PAUSED || 0,
                },
            }).then(response => {
                this.loadData();
            });
        },
        fileRemove (file) {
            if (!file.ID) {
                return;
            }
            BX.ajax.runComponentAction('xpage:ajax', 'orderFileRemove', {
                mode : 'class',
                data : {
                    orderId : this.orderId,
                    fileId : file.ID,
                },
            }).then(response => {
                this.loadData();
            });
        },
        fileInputChanged (input) {
            this.orderFiles = this.$refs.OrderFiles.files;
        },
        searchProducts (orderProduct) {
            clearTimeout(this.searchTimeout);
            orderProduct.UF_ARTICLE = '';
            orderProduct.UF_PRICE = '';
            if (orderProduct.variants.length) {
                let similar = orderProduct.variants.filter(variant => variant.UF_NAME == orderProduct.UF_NAME);
                if (similar.length == 1) {
                    orderProduct.UF_PRODUCT_CODE = similar[0].UF_CODE;
                    orderProduct.UF_ARTICLE = similar[0].UF_ARTICLE;
                    orderProduct.UF_PRICE = similar[0].UF_PRICE;
                    return;
                }
            }
            if (orderProduct.UF_NAME.length >= 3) {
                this.searchTimeout = setTimeout(()=>{
                    BX.ajax.runComponentAction('xpage:ajax', 'searchProducts', {
                        mode : 'class',
                        data : {
                            name : orderProduct.UF_NAME,
                        },
                    }).then(response => {
                        if (response.data) {
                            orderProduct.variants = response.data.products;
                        }
                    });
                },1000);
            }
        },
        addProduct () {
            this.orderProducts.push({
                ID : '_'+(+new Date),
                UF_ARTICLE : '',
                UF_NAME : '',
                UF_QUANTITY : '',
                UF_PRICE : '',
                UF_SUM : '',
                editable : true,
                variants : [],
            });
        },
        loadData () {
            if (!this.orderId) {
                return;
            }
            BX.ajax.runComponentAction('xpage:ajax', 'orderGet', {
                mode : 'class',
                data : {
                    id : this.orderId,
                },
            }).then(response => {
                this.dataLoaded = true;
                this.orderProducts = [];
                if (response.data) {
                    if (response.data.values) {
                        this.$set(this, 'values', response.data.values);
                    }
                    if (response.data.orderProducts) {
                        this.orderProducts = response.data.orderProducts.map(item => {
                            item.editable = false;
                            return item;
                        });
                    }
                }
            });
        },
        save () {
            if (this.processed) {
                return;
            }
            this.processed = true;
            let data = new FormData;
            data.append('id', this.orderId);
            data.append('values', JSON.stringify(this.values));
            data.append('products', JSON.stringify(this.orderProducts));
            if (this.orderFiles.length) {
                for (var i = 0; i < this.orderFiles.length; i++) {
                    data.append('files[]', this.orderFiles[i]);
                }
            }
            BX.ajax.runComponentAction('xpage:ajax', 'orderSave', {
                mode : 'class',
                data,
            }).then(response => {
                this.$refs.OrderFiles.value = '';
                this.orderFiles = [];
                if (response.data && +response.data.id) {
                    if (this.orderId != +response.data.id) {
                        this.orderId = +response.data.id;
                        try {
                            history.pushState({}, '', `${location.pathname}?id=${this.orderId}`);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    this.processed = false;
                    this.loadData();
                }
            });
        },
        takeDataCode(e) {
            let orderId = e.currentTarget.value;
            $('#primary-orders option').each((index, item) => {
                if(item.innerHTML == orderId) {
                    this.values.UF_PRIMARY_ORDER = item.getAttribute('data-order');
                }
            });
        },
    },
}
</script>

<style>
    a.arrow-btn{
        color: #fff;
    }

    .arrow-btn{
        display: inline-block;
    }

    .arrow-btn--small{
        padding: 7px 8px;
    }

    .lc-info-item__add{
        margin: 25px 0 0;
    }

    .lc__info-table input:not([type]),
    .lc__info-table input[type=text]{
        height: 30px;
        padding: 2px 10px;
        border: 1px solid var(--borderColor);
    }

    .count-input{
        max-width: 50px;
    }

    .price-input, .summ-input{
        max-width: 140px;
    }

    .n-wr__save, .n-wr__edit,
    .n-wr__remove{
        margin-top: 10px;
        display: inline-block;
    }

    .n-wr__save:not(:last-child), .n-wr__edit:not(:last-child),
    .n-wr__remove:not(:last-child){
        margin-right: 10px;
    }

</style>
