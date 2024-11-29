<template>
    <transition name="slide-modal">
        <div v-if="open" class="modal">
            <div class="modal-content">
                <h2 class="modal-title p-12">
                    {{ oneFirma ? 'Редактирование фирмы' : 'Добавить фирму' }}
                </h2>
                <form class="modal-form">
                    <div class="form-group">
                        <label>Фирма</label>
                        <input v-model="firma" type="text" required placeholder="Введите название фирмы" />
                    </div>
                    <div class="form-group">
                        <label>Менеджер</label>
                        <input v-model="manager" type="text" required placeholder="Введите имя менеджера" />
                    </div>
                    <div class="form-group">
                        <label>Телефон</label>
                        <input v-model="phone" type="text" placeholder="Введите номер телефона" />
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input v-model="email" type="email" placeholder="Введите email" />
                    </div>
                    <div class="form-group">
                        <label>Адрес</label>
                        <input v-model="address" type="text" required placeholder="Введите адрес" />
                    </div>
                    <div class="form-group" v-if="!oneFirma">
                        <label>Начальная задолженность</label>
                        <input v-model="debts" type="number" placeholder="Введите задолженность" />
                    </div>
                </form>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <div class="modal-buttons gap24 d-flex j-end a-center p-12">
                    <button type="button" class="action-button" @click="closeModal">Отмена</button>
                    <button
                        type="button"
                        class="action-button"
                        @click="handleSubmit"
                        :disabled="isSubmitting" :class="{ 'is-disabled': isSubmitting }"
                    >
                        {{ oneFirma ? 'Сохранить' : 'Создать' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>
<script>
import { ipcRenderer } from 'electron';
import eventNames from '@/universal/eventNames';

export default {
    props: {
        open: {
            type: Boolean,
            default: false,
        },
        oneFirma: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            id: null, 
            firma: '',
            manager: '',
            phone: '',
            email: '',
            paymentMethod:'usd',
            address: '',
            debts: 0,
            errorMessage: '',
            isSubmitting:false,
        };
    },
    watch: {
        oneFirma: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.id = newVal._id || null;
                    this.firma = newVal.firma || '';
                    this.manager = newVal.manager || '';
                    this.phone = newVal.phone || '';
                    this.email = newVal.email || '';
                    this.paymentMethod = newVal.paymentMethod || '';
                    this.address = newVal.address || '';
                    this.debts = newVal.debts || 0;
                }
            },
        },
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        async handleSubmit() {
            if (!this.firma || !this.manager  || !this.address) {
                this.errorMessage = 'Пожалуйста, заполните все обязательные поля';
                return;
            }

            const payload = {
                firma: this.firma,
                manager: this.manager,
                phone: this.phone,
                email: this.email,
                paymentMethod: this.paymentMethod,
                address: this.address,
                debts:this.debts || 0,
            };
            this.isSubmitting=true

            if (this.oneFirma) {
                await ipcRenderer.invoke(eventNames.updateFirmaEvent, JSON.parse(JSON.stringify({...payload, id: this.id}))).then(
                    (res) => {
                        this.isSubmitting=false
                        if(res.status==200){
                            this.$emit('status', {status:200,message:"Фирма успешно измененный"})
                        }
                        else{
                            this.$emit('status', {status:400,message:"Ошибка при измененный на фирма"})
                        }
                    }
                );
            } else {
                await ipcRenderer.invoke(eventNames.createFirmaEvent, JSON.parse(JSON.stringify(payload)))
                .then((res) => {
                        this.isSubmitting=false
                        if(res.status==201){
                            this.$emit('status', {status:201,message:"Фирма успешно добавлена"})
                        }
                        else{
                            this.$emit('status', {status:401,message:"Ошибка при добавяне на фирма"})
                        }
                    }
                );
            }
            this.resetForm();
            this.closeModal();
        },
        resetForm() {
            this.id = null;
            this.firma = '';
            this.manager = '';
            this.phone = '';
            this.email = '';
            this.paymentMethod = 'usd';
            this.address = '';
            this.debts = 0;
            this.errorMessage = '';
        },
    },
};
</script>
