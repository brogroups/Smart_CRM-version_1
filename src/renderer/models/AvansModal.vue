<template>
    <transition class="slide-modal">
        <div class="modal" v-if="open">
            <div class="modal-content">
                <h2>{{ oneAvans ? 'Редактирование аванса' : 'Добавление аванса' }}</h2>
                <form class="modal-form">
                    <div class="form-group">
                        <label>Остальные</label>
                        <input :value="computedQoldiq" type="number" readonly placeholder="Остальные" />
                    </div>
                    <div class="form-group">
                        <label>Продвигать</label>
                        <input v-model="avans" type="number" required placeholder="Введите аванс" />
                    </div>
                    <div class="form-group">
                        <label>Дата</label>
                        <DatePicker placeholder="Выберите день" class="border9 radius1 p10 relative"
                            @dateSelected="date = $event" :writeDay="date" />
                    </div>
                    <div class="form-group">
                        <label>Комментарий</label>
                        <input v-model="comment" type="text" required placeholder="Написать комментарий" />
                    </div>
                </form>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <div class="modal-buttons gap24 d-flex j-end a-center p-12">
                    <button type="button" class="action-button" @click="closeModal">Отмена</button>
                    <button type="button" class="action-button " :disabled="isSubmitting"
                        :class="{ 'is-disabled': isSubmitting }" @click="handleSubmit">{{ oneFirma ? 'Сохранить' :
                            'Создать' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>
<script>
import eventNames from '@/universal/eventNames';
import { ipcRenderer } from 'electron';
import DatePicker from '../components/DatePicker.vue';

export default {
    components: {
        DatePicker
    },
    props: {
        open: {
            type: Boolean,
            default: false,
        },
        oneAvans: {
            type: Object,
            default: null
        },
        payed: {
            type: Object,
        }
    },
    data() {
        return {
            id: this.payed?._id,
            avans: "",
            date: "",
            comment: '',
            isSubmitting: false,
            errorMessage: null,
        }
    },
    computed: {
        computedQoldiq() {
            return this.payed?.qoldiq ? this.payed.qoldiq - (parseFloat(this.avans) || 0) : 0;
        }
    },
    methods: {
        closeModal() {
            this.$emit('close')
        },
        async handleSubmit() {
            this.errorMessage = null;

            // Basic validation
            if (!this.avans || !this.date || !this.comment) {
                this.errorMessage = "Заполните все поля!";
                return; 
            }

            const pay = {
                avans: this.avans,
                date: this.date,
                comment: this.comment,
                id: this.payed?._id, 
            };

            this.isSubmitting = true; 

            try {
                const res = await ipcRenderer.invoke(eventNames.createOrderPaymentEvent, JSON.parse(JSON.stringify(pay)));
                this.isSubmitting = false;

                if (res.status === 200) {
                    this.$emit('status', { status: "success", message: "Аванс успешно получен" });
                } else {
                    this.$emit('status', { status: "error", message: "Ошибка предоплаты аванс" });
                }

                this.closeModal(); 
            } catch (error) {
                this.errorMessage = "Произошла ошибка, повторите попытку позже.";
                console.error(error);
            } finally {
                this.isSubmitting = false
            }

        }

    },
    mounted() {
        if (this.pay?.qoldiq) {
            this.qoldiq = this.pay.qoldiq;
        }
        if (this.oneAvans) {
            this.name = this.oneAvans?.avans
            this.date = this.oneAvans?.date
            this.comment = this.oneAvans?.comment
        }
    }
}
</script>

<style></style>