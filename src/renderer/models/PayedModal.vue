<template>
    <transition name="slide-modal">
        <div v-if="open" class="modal">
            <div class="modal-content">
                <h2 class="modal-title p-12">
                    {{ oneDebts ? 'Редактирование ежедневных расходов' : 'Добавить ежедневные расходы' }}
                </h2>
                <form class="modal-form">
                    <div class="form-group">
                        <label>Причина</label>
                        <input v-model="reason" type="text" required placeholder="Введите причину" />
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
                        <label>Цена</label>
                        <input v-model="price" type="number" placeholder="Введите цену" />
                    </div>
                    <div class="form-group">
                        <label>Описание</label>
                        <input v-model="description" placeholder="Введите описание" />
                    </div>
                    <div class="form-group">
                        <label>Сотрудник</label>
                        <input v-model="worker" type="text" required placeholder="Введите имя сотрудника" />
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

export default {
    props: {
        open: {
            type: Boolean,
            default: false,
        },
        oneDebts: {
            type: Object,
            default:null,
        },
    },
    components: {
        DatePicker,
    },
    data() {
        return {
            id: null, 
            reason: '',
            date: '',
            price: '',
            description: '',
            worker: '',
            errorMessage: '',
            isSubmitting:false
        };
    },
    watch: {
        oneDebts: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.id = newVal._id || null; 
                    this.reason = newVal.reason || '';
                    this.date = newVal.date || '';
                    this.price = newVal.price || '';
                    this.description = newVal.description || '';
                    this.worker = newVal.worker || '';
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
        async handleSubmit() {
            if (!this.reason || !this.date || !this.price || !this.worker) {
                this.errorMessage = 'Пожалуйста, заполните все обязательные поля';
                return;
            }

            const payload = {
                reason: this.reason,
                date: this.date,
                price: this.price || 0,
                description: this.description,
                worker: this.worker,
            };
            this.isSubmitting=true

            if (this.oneDebts) {
                await ipcRenderer.invoke(eventNames.updateDayDebtsEvent, JSON.parse(JSON.stringify({...payload, id:this.id})))
                .then((res) => {
                        this.isSubmitting=false

                        if(res.status==200){
                            this.$emit('status', {status:200,message:"Платеж успешно изменен"})
                        }
                        else{
                            this.$emit('status', {status:400,message:"Ошибка изменения платежа"})
                        }
                    }
                );
            } else {
                await ipcRenderer.invoke(eventNames.createDayDebtsEvent, JSON.parse(JSON.stringify(payload))).then(
                    (res) => {
                        this.isSubmitting=false
                        if(res.status==201){
                            this.$emit('status', {status:201,message:"Платеж успешно добавлен"})
                        }
                        else{
                            this.$emit('status', {status:401,message:"Ошибка добавления платежа"})
                        }
                    }
                );
            }
            this.resetForm();
            this.closeModal();
        },
        resetForm() {
            this.id = null;
            this.reason = '';
            this.date = '';
            this.price = '';
            this.description = '';
            this.worker = '';
            this.errorMessage = '';
        },
    },
};
</script>
