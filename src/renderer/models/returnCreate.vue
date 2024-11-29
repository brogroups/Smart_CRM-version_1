<template>
    <transition name="slide-modal">
        <div v-if="open" class="modal">
            <div class="modal-content">
                <h2 class="modal-title p-12">
                    {{ oneRet ? 'Редактирование возврат продукты' : 'Добавить возврат продукты' }}
                </h2>
                <form class="modal-form">
                    <div class="form-group">
                        <label>Имя клиента</label>
                        <input v-model="clientName" type="text" required placeholder="Введите имя клиента" />
                    </div>
                    <div class="form-group">
                        <label>Название продукта</label>
                        <input v-model="productName" type="text" required placeholder="Введите название продукта" />
                    </div>
                    <div class="form-group">
                        <label>Цена</label>
                        <input v-model="price" type="number" required placeholder="Введите цену" />
                    </div>
                    <div class="form-group">
                        <label>Адрес</label>
                        <input v-model="address" type="text" required placeholder="Введите адрес" />
                    </div>
                    <div class="form-group">
                        <label>Сотрудники </label>
                        <ClientSelect @input="handleInput($event)" :activeWorker="workers||null"/>
                    </div>
                    <div class="form-group">
                        <label>Дата</label>
                        <DatePicker
                            placeholder="Выберите день"
                            class="border9 relative radius1 p10 gray text16"
                            @dateSelected="handleData($event)"
                            :writeDay="date"
                        />
                    </div>
                    <div class="form-group">
                        <label>Описание</label>
                        <input v-model="comment" type="text" required placeholder="Введите описание" />
                    </div>
                </form>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <div class="modal-buttons gap24 d-flex j-end a-center p-12">
                    <button type="button" class="action-button" @click="closeModal">Отмена</button>
                    <button
                        type="button"
                        class="action-button"
                        @click="handleSubmit"
                    >
                        {{ oneDebts ? 'Сохранить' : 'Создать' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { ipcRenderer } from 'electron';
import DatePicker from '../components/DatePicker.vue';
import eventNames from '@/universal/eventNames';
import ClientSelect from '../components/ClientSelect.vue';

export default {
    props: {
        open: {
            type: Boolean,
            default: false,
        },
        oneRet: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        DatePicker,
        ClientSelect
    },
    data() {
        return {
            id:null,
            clientName: '',
            productName: '',
            price: '',
            comment: '',
            date: '',
            workers: '',
            errorMessage: '',
            address:''
        };
    },
    watch: {
        oneRet: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.id=newVal._id,
                    this.clientName = newVal.clientName || '';
                    this.productName = newVal.productName || '';
                    this.price = newVal.price || '';
                    this.comment = newVal.comment || '';
                    this.date = newVal.date || '';
                    this.workers = newVal.workers;
                    this.address=newVal.address
                }
            },
        },
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        handleData(data) {
            this.date = data;
        },
        handleInput(event){
            this.workers=event
        },
        async handleSubmit() {
            if (!this.clientName || !this.productName || !this.price || !this.comment) {
                this.errorMessage = 'Пожалуйста, заполните все обязательные поля';
                return;
            }

            const payload = {
                clientName: this.clientName,
                productName: this.productName,
                price: this.price,
                comment: this.comment,
                date: this.date || new Date(),
                workers: this.workers,
                address:this.address
            };
            const event = this.oneRet?eventNames.updateInvalidEvent:eventNames.createInvalidEvent
            const newPayload = this.oneRet?{...payload,id:this.id}:payload
            await ipcRenderer.invoke(event, JSON.parse(JSON.stringify(newPayload))).then(
                (res) => {
                    
                    if (res.status == 201 ||res.status==200) {
                        this.$emit('status', { status: 201, message: 'Успешно добавлено!' });
                    } else {
                        this.$emit('status', { status: 400, message: 'Ошибка добавления!' });
                    }
                }
            );

            this.resetForm();
            this.closeModal();
        },
        resetForm() {
            this.clientName = '';
            this.productName = '';
            this.price = '';
            this.comment = '';
            this.date = '';
            this.workers = '';
            this.errorMessage = '';
            this.address=''
        },
    },
    mounted(){
    }
};
</script>

<style scoped>
/* Добавьте стили, если нужно */
</style>
