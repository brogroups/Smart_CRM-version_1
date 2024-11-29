<template>
    <transition name="slide-modal">
        <div v-if="open" class="modal">
            <div class="modal-content">
                <h2 class="modal-title p-12">
                    {{ oneDebts ? 'Редактирование платежа' : 'Добавить платеж' }}
                </h2>
                <form class="modal-form">
                    <div class="form-group">
                        <label>Сумма</label>
                        <input v-model="amount" type="number" required placeholder="Введите сумму" />
                    </div>
                    <div class="form-group">
                        <label>Метод оплаты</label>
                        <CustomSelect
                            :options="paymentMethodOptions"
                            @input="paymentMethodEvent($event)"
                            placeholder="Выберите метод оплаты"
                        />
                    </div>
                    <div class="form-group">
                        <label>Дата оплаты</label>
                        <DatePicker
                            placeholder="Выберите дату оплаты"
                            class="border9 relative radius1 p10 gray text16"
                            @dateSelected="handleData($event)"
                            :writeDay="paymentDate"
                        />
                    </div>
                    <div class="form-group">
                        <label>Комментарий</label>
                        <input v-model="comment" placeholder="Введите комментарий"/>
                    </div>
                    
                </form>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <div class="modal-buttons gap24 d-flex j-end a-center p-12">
                    <button type="button" class="action-button" @click="closeModal">Отмена</button>
                    <button
                        type="button"
                        class="action-button"
                        @click="handleSubmit"
                        :disabled="isSubmitting" :class="{ 'is-disabled': isSubmitting }">
                        {{ oneDebts ? 'Сохранить' : 'Создать' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>
<script>
import { ipcRenderer } from 'electron';
import eventNames from '@/universal/eventNames';
import DatePicker from '../components/DatePicker.vue';
import CustomSelect from '../components/CustomSelect.vue';

export default {
    props: {
        open: {
            type: Boolean,
            default: false,
        },
        oneDebts: {
            type: Boolean,
            default: false,
        },
        firmId:{type:String}
    },
    components: {
        DatePicker,
        CustomSelect,
    },
    data() {
        return {
            id: null, 
            amount: '',
            firmaOptions:[],
            paymentMethod: '',
            paymentDate: '',
            comment: '',
            firmaId: '',
            errorMessage: '',
            paymentMethodOptions: [
                { text: 'Наличные', value: 'Наличные' },
                { text: 'Карта', value: 'Карта' },
                { text: 'Банковский перевод', value: 'Банковский перевод' },
            ],
            isSubmitting:false
        };
    },
    watch: {
        oneDebts: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.id = newVal._id || null;
                    this.amount = newVal.amount || '';
                    this.paymentMethod = newVal.paymentMethod || '';
                    this.paymentDate = newVal.paymentDate || '';
                    this.comment = newVal.comment || '';
                    this.firmaId = newVal.firmaId || '';
                }
            },
        },
    },
    methods: {
        handleSelect(event){
            this.firmaId=event
        },
        paymentMethodEvent(event){
            this.paymentMethod=event
        },
        closeModal() {
            this.$emit('close');
        },
        handleData(data) {
            this.paymentDate = data;
        },
        async handleSubmit() {
            if (!this.amount || !this.paymentMethod || !this.paymentDate) {
                
                this.errorMessage = 'Пожалуйста, заполните все обязательные поля';
                return;
            }

            const payload = {
                amount: this.amount,
                paymentMethod: this.paymentMethod,
                paymentDate: this.paymentDate,
                comment: this.comment || '',
                firmaId: this.firmId,
            };
            
            this.isSubmitting=true
            if (this.oneDebts) {
                await ipcRenderer.invoke(eventNames.updatePaymentEvent, JSON.parse(JSON.stringify({ ...payload, id: this.id }))).then(
                    (res) => {
                        this.isSubmitting=false
                        if (res.status === 200) {
                            this.$emit('status', { status: 200, message: 'Платеж успешно изменен' });
                        } else {
                            this.$emit('status', { status: 400, message: 'Ошибка изменения платежа' });
                        }
                    }
                );
            } else {
                await ipcRenderer.invoke(eventNames.createPaymentEvent, JSON.parse(JSON.stringify(payload))).then(
                    (res) => {
                        this.isSubmitting=false
                        console.log(res,'dappa');
                        
                        if (res.status === 201) {
                            this.$emit('status', { status: 201, message: 'Платеж успешно добавлен' });
                        } else {
                            this.$emit('status', { status: 401, message: 'Ошибка добавления платежа' });
                        }
                    }
                );
            }
            this.resetForm();
            this.closeModal();
        },
        resetForm() {
            this.id = null;
            this.amount = '';
            this.paymentMethod = '';
            this.paymentDate = '';
            this.comment = '';
            this.firmaId = '';
            this.errorMessage = '';
        },
    },
    mounted() {
        this.firmaId=this.firmId
    }

};
</script>
