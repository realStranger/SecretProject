<template>
    <div class="">
        <div class="chat-open-btn">
            <img src="/local/templates/mossman2018/img/ico-chat.svg" alt="">
        </div>
        <div class="chat fixed active">
            <div v-if="unreadMsg  != ''" class="chat-unread">
                <div class="chat-unread-head">Непрочитанные сообщения</div>
                <div class="chat-unread-left">Отправитель</div>
                <div class="chat-unread-right">Документ</div>
                <a v-for="item in unreadMsg" :key="item.ID" :href="checkOrder(item.ORDER_ID, item.CLAIM_ID)" class="chat-unread__msg">
                    <div class="chat-unread__msg-sender">{{ item.USER_NAME }}</div>
                    <div class="chat-unread__msg-order">{{ checkOrderName(item.ORDER_SEC_ID, item.CLAIM_SEC_ID) }}</div>
                </a>
            </div>
            <div class="chat-header">
                <div class="chat-title">Сообщения</div>
                <div class="chat-btn">
                    <div class="chat-toggle"><img src="/local/templates/mossman2018/img/ico-toggle-chat.svg" alt=""></div>
                    <div class="chat-close"><img src="/local/templates/mossman2018/img/ico-close-chat.svg" alt=""></div>
                </div>
            </div>
            <div class="chat-body">
                <div class="chat-content">
                    <div v-for="(dateItems, date) in itemsByDate" :key="date" class="chat-items">
                        <div class="chat-date"><span>{{ date }}</span></div>
                        <div v-for="item in dateItems" :key="item.ID"
                        class="chat-item"
                        :data-message="item.UF_CODE"
                        :data-author="item.UF_USER_CODE"
                        :data-subject="item.UF_SUBJECT"
                        :data-text="item.UF_TEXT"
                        :class="{
                            'message-in' : item.UF_USER_ID != userData.ID && item.UF_USER_CODE != userData.XML_ID,
                            'message-out' : item.UF_USER_ID == userData.ID || item.UF_USER_CODE == userData.XML_ID,
                            'selected' : item.UF_CODE == messageSelect,
                            }"
                            >
                            <div class="sender-name color-text">{{ [ item.USER_LAST_NAME, item.NAME, item.USER_SECOND_NAME, ].filter(v=>v).join(' ') }}</div>
                            <div class="message-subject"><div class="message-subject-head">Тема: </div>{{ item.UF_SUBJECT }}</div>
                            <div class="message-text">
                                {{ item.UF_TEXT }}
                                <div v-if="item.files && item.files.length" class="message-attach">
                                    <div v-for="file in item.files" :key="file.id" class="message-attach__item">
                                        <a :href="file.src" target="_blank" >{{ file.filename }}</a>
                                    </div>
                                </div>
                            </div>
                            <div v-if="item.UF_USER_ID != userData.ID && item.UF_USER_CODE != userData.XML_ID" @click="selectMessage" class="message-reply">Ответить</div>
                            <div class="message-time"><span>{{ item.timeFormat }}</span></div>
                        </div>
                    </div>
                </div>
                <div class="chat-footer">
                    <div class="messenger-subject messenger-reply">
                        <div @click="resetForm" class="chat-footer-reset-form"></div>
                        <label for="messenger-reply">Первичное сообщение:</label>
                        <input type="text" id="messenger-reply" name="messenger-reply" :value="messageSelectText" placeholder="Нажмите на сообщение для его выбора" disabled>
                    </div>
                    <div class="messenger-staff-select">
                        <label for="staff-select">Получатель:</label>
                        <select name="staff-select" id="staff-select" v-model="userRecive">
                            <option value>Выберите получателя</option>
                            <option v-for="user in this.usersFiltered" v-bind:key="user.ID" v-bind:value="user.XML_ID">{{ user.NAME }}</option>
                        </select>
                    </div>
                    <div class="messenger-subject">
                        <label for="messenger-subject-text">Тема сообщения:</label>
                        <input type="text" id="messenger-subject-text" v-model="subject" name="messenger-subject-text" placeholder="Напишите тему сообщения">
                    </div>
                    <div class="messenger-textarea-wrap">
                        <div class="messenger-textarea">
                            <editable ref="textArea" :content="text" @update="text = $event" class="messenger-textarea-input" @keyup-enter="addMessage()" ></editable>
                            <span class="messenger-placeholder">Оставьте комментарий...</span>
                        </div>
                        <label for="chat-file" class="send-photo">
                            <img src="/local/templates/mossman2018/img/ico-photo-chat.svg" alt="">
                        </label>
                        <input @change="preparedFiles = $event.target.files" id="chat-file" multiple type="file" style="display: none;" />
                    </div>
                    <div @click.prevent="addMessage()" class="send-message">
                        <img src="/local/templates/mossman2018/img/ico-send-chat.svg" alt="">
                    </div>
                    <div v-if="preparedFiles.length" class="messenger-prepared-files" >
                        <div v-for="file in preparedFiles" :key="file.lastModified" class="messenger-prepared-files" >
                            {{ file.name }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import moment from 'moment';
moment.locale('ru');
window.moment = moment;

export default {
    name : 'Chat',
    props : {
        claimId : {
            type : Number,
            default : 0,
        },
        orderId : {
            type : Number,
            default : 0,
        },
        userData : {
            type : Object,
            default : () => ({}),
        },
    },
    data : () => ({
        preparedFiles : [],
        items : [],
        subject : '',
        userRecive : '',
        text : '',
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
        usersFiltered : '',
        usersAll: '',
        messageSelect : '',
        messageSelectText : '',
        userSelect : '',
        unreadMsg : '',
    }),
    computed : {
        itemsByDate () {
            let itemsByDate = {}, item, m, date;
            for (var i = 0; i < this.items.length; i++) {
                item = this.items[i];
                m = moment.unix(item.timestamp);
                date = m.format('DD MMMM YYYY');
                if (!itemsByDate[date]) {
                    itemsByDate[date] = [];
                }
                item.timeFormat = m.format('HH:mm');
                itemsByDate[date].push(item);
            }
            return itemsByDate;
        },
    },
    mounted () {
        this.loadData();

        setInterval(()=>{
            this.loadData();
        }, 300000);    
        
        var app = this;

        $('.lc-cont').each(function(){
            var sticky =  $('.chat-open-btn');
            var stickyWrap = $('.lc-cont')

            $(window).scroll(function(){
                var nsc = $(document).scrollTop();
                var bp1 = stickyWrap.offset().top;
                var bp2 = bp1 + stickyWrap.outerHeight()-$(window).height();
                if (nsc>bp1) {
                    sticky.css('position','fixed');
                    sticky.addClass('fixed');
                }
                else {
                    sticky.css('position','absolute');
                    sticky.css('top', '0 !important');
                    sticky.removeClass('fixed');
                }
                if (nsc>bp2) {
                    sticky.css('top', bp2-nsc);
                }
                else {
                    sticky.css('top', '245px');
                }
            });
        });

        $('.chat-open-btn').on('click', function(){
            $('.chat').toggleClass('active');
            app.loadData();
        });

        $('.chat-close').on('click', function(){
            $('.chat').removeClass('active');
        });

        $('.chat-toggle').on('click', function(){
            $('.chat-body').slideToggle();
            app.loadData();
        });

        $(window).scroll(function(){
            let heightToBottomEdge = $(window).scrollTop() + window.innerHeight;
            let canSeeFooter = heightToBottomEdge > $('.footer').offset().top;
            if(canSeeFooter && !window.absoluted)
            {
                $('.chat').toggleClass('absolute');
                $('.chat').toggleClass('fixed');
                window.absoluted=true;
            }

            if(!canSeeFooter && window.absoluted)
            {
                $('.chat').toggleClass('absolute');
                $('.chat').toggleClass('fixed');
                window.absoluted=false;
            }

        });
    },
    watch : {
		items (messages, oldMessages) {
			if (messages.length != oldMessages.length) {
				setTimeout(() => {
					this.$el.querySelector('.chat-content').scrollTop = this.$el.querySelector('.chat-content').scrollHeight - this.$el.querySelector('.chat-content').clientHeight;
				}, 300);
			}
		},
    },
    methods : {
        loadData () {
            BX.ajax.runComponentAction('xpage:ajax', 'chatLoadData', {
                mode : 'class',
                data : {
                    claimId : this.claimId,
                    orderId : this.orderId,
                    userXML : this.userData.XML_ID,
                    userID : this.userData.ID
                },
            }).then(response => {
                if (response.data) {
                    if (response.data.items && response.data.items.length) {
                        let unreadMsgIds = [];
                        let items = response.data.items;
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].UF_READ_USER_ID_NEW) {
                                items[i].UF_READ_USER_ID_NEW = items[i].UF_READ_USER_ID_NEW.split(',');
                            }
                            if (!items[i].UF_READ_USER_ID_NEW || !~items[i].UF_READ_USER_ID_NEW.indexOf(+this.userData.ID)) {
                                unreadMsgIds.push(items[i].ID);
                            }
                        }
                    
                        this.items = items;
                        if (unreadMsgIds.length && document.querySelector('.chat-body').offsetParent) {
                            this.setMessagesRead(unreadMsgIds, this.userData.XML_ID);
                        }
                    }
                    this.$set(this, 'values', response.data.values);
                    if(response.data.messages) {
                        this.unreadMsg = response.data.messages;
                    }
                    if(this.values.UF_TYPE == 'Рекламация') {
                        BX.ajax.runComponentAction('xpage:ajax', 'getStaffList', {
                            mode : 'class',
                            data : {
                                filter : 'Менеджер рекламационного отдела'
                            },
                        }).then(response => {
                            if (response.data) {
                                this.usersFiltered = response.data.users.FILTERED;
                                this.usersAll = response.data.users.ALL;
                            }
                        });
                    } else if (this.values.UF_TYPE == null) {
                        BX.ajax.runComponentAction('xpage:ajax', 'getStaffList', {
                            mode : 'class',
                            data : {
                                filter : 'Ответственный по запросам'
                            },
                        }).then(response => {
                            if (response.data) {
                                this.usersFiltered = response.data.users.FILTERED;
                                this.usersAll = response.data.users.ALL;
                            }
                        });
                    } else {
                        BX.ajax.runComponentAction('xpage:ajax', 'getStaffList', {
                            mode : 'class',
                            data : {
                                filter : 'Менеджер'
                            },
                        }).then(response => {
                            if (response.data) {
                                this.usersFiltered = response.data.users.FILTERED;
                                this.usersAll = response.data.users.ALL;
                            }
                        });
                    }
                }
            });
         },
        setMessagesRead (id = [], user_xml) {
            if (id.length) {
                BX.ajax.runComponentAction('xpage:ajax', 'chatSetMessagesRead', {
                    mode : 'class',
                    data : {
                        id, user_xml, 
                    },
                }).then(response => {

                });
            }
        },
        addMessage () {
            if(this.userRecive == '') {
                alert('Выберите получателя сообщения!');
            } else if (this.text == '') {
                alert('Введите текст сообщения!');
            } else {
                let fileInput = this.$el.querySelector('#chat-file');
                let data = new FormData;
                data.append('orderId', this.orderId);
                data.append('claimId', this.claimId);
                data.append('text', this.text);
                if(this.subject == '') {
                    data.append('subject', this.text);
                } else {
                    data.append('subject', this.subject);
                }
                data.append('userRecive', this.userRecive);
                data.append('messageSelect', this.messageSelect);
                if (fileInput.files && fileInput.files.length) {
                    for (var i = 0; i < fileInput.files.length; i++) {
                        data.append('file[]', fileInput.files[i]);
                    }
                }
                BX.ajax.runComponentAction('xpage:ajax', 'chatAddMessage', {
                    mode : 'class',
                    data,
                }).then(response => {
                    this.text = '';
                    this.loadData();
                    this.$refs.textArea.clear();
                    this.preparedFiles = [];
                    fileInput.value = '';
                    this.userRecive = '',
                    this.messageSelect = '';
                    this.subject = '';
                    this.messageSelectText = '';
                });
            }
            
        },
        selectMessage (e) {
            this.messageSelect = e.currentTarget.parentNode.getAttribute('data-message');
            this.userRecive = e.currentTarget.parentNode.getAttribute('data-author');
            this.messageSelectText = e.currentTarget.previousSibling.innerHTML.replace(/<\/?[^>]+(>|$)/g, "");
            let subjectSubject = e.currentTarget.parentNode.getAttribute('data-subject');
            let subjectText = e.currentTarget.parentNode.getAttribute('data-text');
            let subject = subjectSubject ? subjectSubject : subjectText;
            this.subject = 'Re: ' + subject;
            $('#staff-select').empty();
            BX.ajax.runComponentAction('xpage:ajax', 'getUser', {
                mode : 'class',
                data : {
                    user_code : this.userRecive
                },
            }).then(response => {
                if (response.data) {
                    let newOption = new Option(response.data.NAME, response.data.XML_ID);
                    document.getElementById('staff-select').append(newOption);
                }
            });
            
        },
        resetForm() {
            this.messageSelect = '';
            this.userRecive = '';
            this.messageSelectText = '';
            this.subject = '';
            $('#staff-select').empty();
            let newOption = new Option('Выберите получателя', '');
            document.getElementById('staff-select').append(newOption);
            $.each(this.usersFiltered, function(index, user) {
                let newOption = new Option(user.NAME, user.XML_ID);
                document.getElementById('staff-select').append(newOption);
            });
        },
        checkOrder(orderID, claimID) {
            if(orderID) {
                return '/lk/orders/?id=' + orderID;
            } else if (claimID) {
                return '/lk/claims/?id=' + claimID;
            } 
        },
        checkOrderName(orderID, claimID) {
            if(orderID) {
                return 'Заказ №' + orderID;
            } else if (claimID) {
                return 'Запрос №' + claimID;
            } 
        },
    },
}
</script>
