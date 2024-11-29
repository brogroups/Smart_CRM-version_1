<template>
    <div class="page settings-page d-flex column gap24">
        <div class="page-top d-flex j-between a-center">
            <div class="d-flex gap24 a-center">
                <Icons class="cancelled" name="leftArrow" @click="this.$emit('exitProduct')" />
                <h2 class="page-title">{{ oneProduct?.clientName }}</h2>
            </div>
            <div class="d-flex gap12">
                <div class="create-button" @click="isRasxod = true">Расходы продукта</div>
                <div class="create-button" @click="handleOpenAvans">Аванс создание</div>
            </div>
        </div>
        <div class="page-bottom d-flex column gap24 scroll">
            <div class="oneProduct d-flex wrap gap12 j-between">

                <div class="w-50 border1 p12 radius1">
                    <p style="color: gray; margin: 0;">Статус заказа:</p>
                    {{ oneProduct?.status }}
                </div>
                <div class="w-50 border1 p12 radius1">
                    <p style="color: gray; margin: 0;">Дата начала:</p>
                    {{ formatDate(oneProduct?.startDate) }}
                </div>
                <div class="w-50 border1 p12 radius1">
                    <p style="color: gray; margin: 0;">Дата окончания:</p>
                    {{ formatDate(oneProduct?.endDate) }}
                </div>
                <div class="w-50 border1 p12 radius1">
                    <p style="color: gray; margin: 0;">Цена продукта:</p>
                    {{ formatSumma(oneProduct?.price) }} сум
                </div>
                <div class="w-50 border1 p12 radius1">
                    <p style="color: gray; margin: 0;">Аванс:</p>
                    {{ formatSumma(oneProduct?.avans) }} сум
                </div>

                <div class="w-50 border1 p12 radius1">
                    <p style="color: gray; margin: 0;">Оставшаяся сумма:</p>
                    {{ formatSumma(oneProduct?.qoldiq) }} сум
                </div>
                <div class="w-50 border1 p12 radius1">
                    <p style="color: gray; margin: 0;">Адрес доставки:</p>
                    {{ oneProduct?.address }}
                </div>
                <div class="w-50 border1 p12 radius1">
                    <p style="color: gray; margin: 0;">Адрес доставки:</p>
                    {{ oneProduct?.paymentMethod }}
                </div>
                <div class="w-50 border1 p12 radius1">
                    <p style="color: gray; margin: 0;">Адрес доставки:</p>
                    {{ oneProduct?.phone }}
                </div>

            </div>
            <div class="d-flex columnlar column">
                <div class="d-flex column">
                    <h3>Заказанные товары</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Название продукта</th>
                                <th>Сумма</th>
                                <th>Количество</th>
                                <th>Общая сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="data in oneProduct?.products" :key="data.index">
                                <td>{{ data.title }}</td>
                                <td>{{ formatSumma(data.price) }}</td>
                                <td>{{ data.quantity }}</td>
                                <td>{{ formatSumma(data?.price * data?.quantity) }}</td>
                            </tr>


                        </tbody>
                    </table>
                </div>
                <div class="d-flex column">
                    <h3>Оплаченные авансы</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Сумма</th>
                                <th>Дата</th>
                                <th>Описание</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="data in oneProduct?.payments" :key="data.index">
                                <td>{{ formatSumma(data?.avans) }}</td>
                                <td>{{ formatDate(data?.date) }}</td>
                                <td>{{ data?.comment }}</td>
                                <td class="d-flex j-end gap12">
                                    <Icons name="edit" class="info icon" @click="handleOpenAvans(data)"/>
                                    <Icons name="deleted" class="danger icon" @click="handleDeleteAvans(data._id)" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="d-flex column">
                    <h3>Расходы продукта</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Продукт</th>
                                <th>Сумма</th>
                                <th>Количество</th>
                                <th>Общая сумма</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="data in oneProduct?.satisfactions" :key="data.index">
                                <td>{{ data?.title }}</td>
                                <td>{{ formatSumma(data?.price) }}</td>
                                <td>{{ data?.quantity }}</td>
                                <td>{{ formatSumma(data?.price * data?.quantity) }}</td>
                                <td class="d-flex gap12 j-end">
                                    <Icons name="deleted" class="danger icon" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="d-flex column p12" style="align-items:end;">
                <p class="text16">Общий доход: <strong>{{ formatSumma(oneProduct?.price) }}</strong> сум</p>
                <p class="text16">Расходы <strong></strong>{{ formatSumma(totalExpenses) }} сум</p>
                <p class="text16" :style="{ color: profitOrLoss >= 0 ? 'green' : 'red' }">
                    {{ profitOrLoss >= 0 ? 'Выгода:' : 'Повреждать:' }}
                    <strong>{{ formatSumma(Math.abs(profitOrLoss)) }}</strong> сум
                </p>
            </div>
        </div>
    </div>
    <RasxodMany :open="isRasxod" :orderId="product" @close="isRasxod = false" @status="handleStatus($event)" />
    <AvansModal :open="openAvans" v-if="openAvans" :payed="newObj" @close="openAvans = false"
        @status="handleStatus($event)" />
    <Toastiff :toastOptions="toastOptions" />
    <RequiredModal :isVisible="visible" @response="handleDeleteResponse($event)" />

</template>

<script>
import eventNames from '../../universal/eventNames.js';
import { ipcRenderer } from 'electron';
import Icons from '../components/Icons.vue';
import RasxodMany from '../utils/RasxodMany.vue';
import AvansModal from '../models/AvansModal.vue';
import Toastiff from '../utils/Toastiff.vue';
import RequiredModal from '../components/requiredModal.vue';

export default {
    props: {
        product: String,
    },
    data() {
        return {
            oneProduct: {},
            isRasxod: false,
            openAvans: false,
            newObj: null,
            deleteId: null,
            visible: false,
            toastOptions: {
                open: false,
                text: "",
                style: { background: "#4CAF50" }
            }
        };
    },
    components: {
        Icons,
        RasxodMany,
        AvansModal,
        Toastiff,
        RequiredModal
    },
    emits: ['exitProduct'],
    computed: {
        totalExpenses() {
            return this.oneProduct?.satisfactions?.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0) || 0;
        },
        profitOrLoss() {
            const income = this.oneProduct?.price || 0;
            const expenses = this.totalExpenses;
            return income - expenses;
        }
    },
    methods: {
        handleDeleteAvans(id) {
            this.deleteId = id,
                this.visible = true
        },
        async handleDeleteResponse(event) {
            this.visible = false
            if (event) {
                await ipcRenderer.invoke(eventNames.deleteOrderPaymentEvent, { id: this.deleteId })
                    .then((res) => {
                        if (res.status == 200) {
                            this.GetOneProduct()
                        }
                    })
            }
        },

        handleOpenAvans(avansData) {
            this.openAvans = true;
            this.newObj = avansData; // Assign the selected avans data to newObj
        },


        async handleStatus(event) {
            this.openAvans = false
            this.isRasxod = false
            if (event?.status == 200 || event?.status == 201) {
                await this.GetOneProduct()
                this.toastOptions = {
                    open: true,
                    text: event?.message,
                    style: { background: "#4CAF50" }
                }

            }
            else {
                this.toastOptions = {
                    open: true,
                    text: 'Ошибка сервера. Попробуйте еще раз.',
                    style: { background: "#4d79ff" }
                }
            }
        },
        async GetOneProduct() {
            try {
                const data = { id: this.product };
                const res = await ipcRenderer.invoke(eventNames.OneProductEvent, data);
                if (res.status === 200) {
                    this.oneProduct = res?.data
                }
            } catch (error) {
                console.error('Xatolik yuz berdi:', error);
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString('ru-RU');
        },
        formatSumma(summa) {
            return new Intl.NumberFormat('ru-RU').format(summa);
        },

    },
    mounted() {
        this.GetOneProduct();
    },
};
</script>
<style>
.w-50>p {
    margin: 0;
    font-size: 14px;
}

.cancelled>svg {
    width: 36px;
    height: 36px;
}

.columnlar>div>h3 {
    font-size: 22px;
    margin-left: 12px;
    font-weight: 500;
    color: #919191
}

.columnlar {
    margin-top: 100px;
    gap: 160px;
}
</style>
