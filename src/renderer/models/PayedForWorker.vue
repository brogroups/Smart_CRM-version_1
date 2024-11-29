<template>
    <transition name="slide-modal">
        <div v-if="open" class="modal">
            <div class="modal-content">
                <h2 class="modal-title p-12">
                    {{ editData ? 'Редактирование платежа для сотрудника' : 'Добавить платеж для сотрудника' }}
                </h2>
                <form class="modal-form">

                    <div class="form-group">
                        <label>Сумма</label>
                        <input 
                            v-model="amount" 
                            type="number" 
                            required 
                            placeholder="Введите сумму" 
                        />
                    </div>
                    <div class="form-group">
                        <label>Дата оплаты</label>
                        <DatePicker
                            placeholder="Выберите дату оплаты"
                            class="border9 relative radius1 p10 gray text16"
                            @dateSelected="handlePaymentDate($event)"
                            :writeDay="paymentDate"
                        />
                    </div>

                    <!-- Comment Field -->
                    <div class="form-group">
                        <label>Комментарий</label>
                        <input 
                            v-model="comment" 
                            placeholder="Введите комментарий" 
                        />
                    </div>

                    <!-- Status Field -->
                    <div class="form-group">
                        <label>Статус</label>
                        <CustomSelect
                            :options="statusOptions"
                            @input="handleStatusChange($event)"
                            placeholder="Выберите статус"
                        />
                    </div>
                </form>

                <!-- Error Message -->
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

                <!-- Action Buttons -->
                <div class="modal-buttons gap24 d-flex j-end a-center p-12">
                    <button 
                        type="button" 
                        class="action-button" 
                        @click="closeModal"
                    >
                        Отмена
                    </button>
                    <button 
                        type="button" 
                        class="action-button" 
                        @click="handleSubmit"
                        :disabled="isSubmitting" :class="{ 'is-disabled': isSubmitting }">
                        {{ isEditMode ? 'Сохранить' : 'Создать' }}
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
        worker: {
            type: String,
        },
        editData: {
            type: Object,
            default: () => ({}),
        },
    },
    components: {
        DatePicker,
        CustomSelect,
    },
    data() {
        return {
            amount: '',
            paymentDate: '',
            comment: '',
            status: 'Avans',
            workerId: '',
            isSubmitting:false,
            errorMessage: '',
            statusOptions: [
                { text: 'Avans', value: 'Avans' },
                { text: 'Shtrafs', value: 'Shtrafs' },
                { text: 'Ежемесячно', value: 'Ежемесячно' },
                { text: 'Доп работает', value: 'Доп работает' },
            ],
        };
    },
    watch: {
        editData: {
            immediate: true,
            handler(newData) {
                if (this.isEditMode && newData) {
                    this.amount = newData.amount || '';
                    this.paymentDate = newData.paymentDate || '';
                    this.comment = newData.comment || '';
                    this.status = newData.status || 'Avans';
                    this.workerId = newData.workerId || '';
                }
            },
        },
    },
    methods: {
        handlePaymentDate(date) {
            this.paymentDate = date;
        },
        handleStatusChange(status) {
            this.status = status;
        },
        handleWorkerSelection(workerId) {
            this.workerId = workerId;
        },
        closeModal() {
            this.$emit('close');
        },
        async handleSubmit() {
            if (!this.amount || !this.paymentDate || !this.comment) {
                this.errorMessage = 'Пожалуйста, заполните все обязательные поля';
                return;
            }

            const payload = {
                amount: this.amount,
                date: this.paymentDate,
                comment: this.comment,
                status: this.status,
                workerId: this.worker,
            };
            console.log(payload);
            
            this.isSubmitting=true
            if (this.editData) {
                await ipcRenderer.invoke(eventNames.updatePaymentEvent, { ...payload, id: this.editData._id }).then(res => {
                    this.isSubmitting=false
                    this.handleResponse(res, 'Данные успешно изменены');
                    this.$emit('status', {status:200})
                });
            } else {
                await ipcRenderer.invoke(eventNames.createWorkerPaymentEvent, payload).then(res => {
                    this.isSubmitting=false
                    this.handleResponse(res, 'Данные успешно добавлены');
                    if(res.status==200){
                        this.$emit('status', {status:200})
                    }
                });
            }
            this.resetForm();
            this.closeModal();
        },
        handleResponse(response, successMessage) {
            if (response.status === 200 || response.status === 201) {
                this.$emit('status', { status: response.status, message: successMessage });
            } else {
                this.$emit('status', { status: 400, message: 'Ошибка обработки данных' });
            }
        },
        resetForm() {
            this.amount = '';
            this.paymentDate = '';
            this.comment = '';
            this.status = 'Avans';
            this.workerId = '';
            this.errorMessage = '';
        },
    },
    mounted() {
    },
};
</script>
