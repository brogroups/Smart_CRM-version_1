<template>
    <div class="page d-flex column gap24">
        <div class="page-top d-flex a-center j-between">
            <div class="d-flex a-center gap12">
                <Icons name="leftArrow" class="cancelled" @click="this.$emit('exitFirma')" />
                <h2>{{ OneFirma?.firma }}</h2>
                <div class="item p12">{{ OneFirma?.debts < 0 ? '+' : '-' }}{{ formatSumma(Math.abs(OneFirma?.debts))
                        }}</div>
                </div>
                <div class="d-flex gap12">
                    <div class="create-button" @click="isPay = true">Платежная фирма</div>
                    <div class="create-button" @click="isOpen = true">Создать продукта</div>
                </div>
            </div>
            <div class="border9 radius1 p12">
                <div class="d-flex gap12 tabbar">
                    <button :class="{ active: activePage === 'product' }" @click="changeTab('product')">Продукт</button>
                    <button :class="{ active: activePage === 'payments' }"
                        @click="changeTab('payments')">Платежи</button>
                </div>
            </div>
            <div class="page-bottom d-flex column gap12">
                <div v-if="activePage === 'product'" class="d-flex column gap12">
                    <!-- Продуктlar kontenti -->
                    <div class="items d-flex column gap12">
                        <div class="flexbox d-flex a-center j-between">
                            <div class="flex1">Название материалы</div>
                            <div class="flex1">Цена за штуку</div>
                            <div class="flex1">Количество</div>
                            <div class="flex1">Общая сумма</div>
                            <div class="flex1"></div>
                        </div>
                    </div>
                    <div class="items d-flex column gap6" v-for="data in OneFirma?.saleProducts" :key="data._id">
                        <div class="flexbox d-flex a-center j-between">
                            <h3 class="flex1">{{ data.name }}</h3>
                            <b class="flex1">{{ formatSumma(data?.price) }}</b>
                            <b class="flex1">{{ data.quantity }}</b>
                            <b class="flex1">{{ formatSumma(data?.price * data?.quantity) }}</b>
                            <div class="d-flex gap12 a-center">
                                <Icons name="edit" class="info icon" @click="handleEdit(data)" />
                                <Icons name="deleted" class="danger icon" @click="handleDelete(data._id)" />
                                <Icons :name="activeArchiveId === data._id ? 'topArrow' : 'bottomArrow'"
                                    @click="toggleArchive(data._id)"
                                    :class="{ active: activeArchiveId === data._id }" />
                            </div>
                        </div>

                        <div v-if="activeArchiveId === data._id" class="archive scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Название продукта</th>
                                        <th>Цена</th>
                                        <th>Количество</th>
                                        <th>Общая цена</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in archiveData" :key="item._id">
                                        <td>{{ item?.productName || item?.clientName }}</td>
                                        <td>{{ formatSumma(item?.productPrice) }}</td>
                                        <td>{{ item?.productCount }}</td>
                                        <td>{{ formatSumma(item?.productPrice * item?.productCount) }}</td>
                                    </tr>
                                    <tr v-if="!archiveData?.length">История недоступна</tr>
                                </tbody>
                            </table>

                        </div>
                    </div>
                    <div class="d-flex j-center p12" v-if="!OneFirma?.saleProducts?.length">Нет товаров</div>
                </div>
                <div v-else-if="activePage === 'payments'" class="d-flex column gap12">
                    <div class="items d-flex column gap12">
                        <div class="flexbox d-flex a-center j-between">
                            <div class="flex1">Способ оплаты</div>
                            <div class="flex1">Дата</div>
                            <div class="flex1">Сумма</div>
                            <div class="flex1">Комментарий</div>
                            <div class="flex1"></div>
                        </div>
                    </div>
                    <div class="items d-flex column gap12" v-for="payment in OneFirma?.payments" :key="payment._id">
                        <div class="flexbox d-flex a-center j-between">
                            <p class="flex1">{{ payment?.paymentMethod }}</p>
                            <p class="flex1">{{ formatDate(payment.paymentDate) }}</p>
                            <b class="flex1">{{ formatSumma(payment.amount) }}</b>
                            <p class="flex1">{{ payment.comment }}</p>
                            <p class="d-flex j-end gap12">
                                <Icons name="deleted" class="danger icon" @click="handlePaySales(payment._id)" />
                            </p>
                        </div>
                    </div>
                    <div class="d-flex j-center p12" v-if="!OneFirma?.payments?.length">Нет платежей</div>
                </div>
            </div>
        </div>
        <MaterialCreate :open="isOpen" :initialData="oneMaterial" @close="isOpen = false" :firmaId="firma"
            @status="handleStatus($event)" />
        <RequiredModal :isVisible="visible" @response="handleResponse($event)" />
        <RequiredModal :isVisible="visibleDel" @response="handleDeletePayments($event, 'deletePay')" />
        <PayedForFirma :open="isPay" :firmId="OneFirma._id" @close="isPay = false" @status="handleStatus($event)" />
        <Toastiff :toastOptions="toastOptions" />

</template>

<script>
import { ipcRenderer } from 'electron';
import eventNames from '@/universal/eventNames';
import MaterialCreate from '../models/MaterialCreate.vue';
import Icons from '../components/Icons.vue';
import RequiredModal from '../components/requiredModal.vue';
import PayedForFirma from '../models/PayedForFirma.vue';
import Toastiff from '../utils/Toastiff.vue';

export default {
    props: {
        firma: {
            type: String,
        }
    },
    emits: ['exitFirma'],
    components: {
        MaterialCreate,
        Icons,
        RequiredModal,
        PayedForFirma,
        Toastiff
    },
    data() {
        return {
            OneFirma: {},
            isOpen: false,
            activeArchiveId: null,
            archiveData: [],
            oneMaterial: null,
            visible: false,
            oneData: null,
            activePage: 'product',
            isPay: false,
            deleteFIrmapay: null,
            visibleDel: false,
            toastOptions: {
                open: false,
                text: "",
                style: { background: "#4CAF50" }
            },
        };
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString('ru-RU');
        },
        changeTab(tab) {
            this.activePage = tab;
        },
        formatSumma(summa) {
            return new Intl.NumberFormat('ru-RU').format(summa);
        },
        handlePaySales(id) {
            this.deleteFIrmapay = id
            this.visibleDel = true
        },
        async handleDeletePayments(event) {
            if (event) {
                await ipcRenderer.invoke(eventNames.deletePaymentEvent, { id: this.deleteFIrmapay })
                    .then((res) => {
                        this.visibleDel=false
                        if (res.status == 200) {
                            this.GetOneProduct()
                            this.toastOptions = {
                                open: true,
                                text: "Платеж успешно удален",
                                style: { background: "#4CAF50" }
                            }
                        }
                    })
            }
        },
        async handleEdit(data) {
            this.oneMaterial = data
            this.isOpen = true
        },
        async GetOneProduct() {
            try {
                const res = await ipcRenderer.invoke(eventNames.oneFirmaEvent, { id: this.firma });
                if (res.status === 200) {
                    this.OneFirma = res?.data;
                } else {
                    console.error("Mahsulotni olishda xatolik:", res.message);
                }
            } catch (error) {
                console.error("So'rovda xatolik:", error);
            }
        },
        async handleStatus(event) {
            if (event == 'success' || event.status == 200 || event.status == 201) {
                this.toastOptions = {
                    open: true,
                    text: "Деньги были успешно выплачены компании.",
                    style: { background: "#4CAF50" }
                }
                await this.GetOneProduct()
            } else {
                this.toastOptions = {
                    open: true,
                    text: "Ошибка в оплате компании",
                    style: { background: "#F44336" }
                }
            }

        },
        handleDelete(id) {
            this.oneData = id
            this.visible = true
        },
        handleResponse(event) {
            if (event) {
                this.deleteItem()
            }
            this.visible = false
        },
        async deleteItem() {

            await ipcRenderer.invoke(eventNames.deleteSalesEvent, { id: this.oneData })
                .then((res) => {
                    if (res.status == 200) {
                        this.handleStatus('success')
                    }
                })
        },
        async toggleArchive(id) {
            if (this.activeArchiveId === id) {
                this.activeArchiveId = null;
                this.archiveData = [];
                return;
            }
            this.activeArchiveId = id;
            try {
                const res = await ipcRenderer.invoke(eventNames.oneSalesEvent, { id });
                if (res.status === 200) {
                    console.log(res);
                    this.archiveData = res?.histories;
                } else {
                    console.error("Arxivni olishda xatolik:", res.message);
                    this.activeArchiveId = null;
                }
            } catch (error) {
                console.error("So'rovda xatolik:", error);
                this.activeArchiveId = null;
            }
        },

    },
    mounted() {
        this.GetOneProduct();
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    }
};
</script>
<style scoped>
.header {
    font-weight: bold;
    border-bottom: 1px solid #ddd;
    padding-bottom: 8px;
    margin-bottom: 12px;
}

.items {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
}

.archive {
    width: 100%;
    max-height: 300px;
    background: #f9f9f9;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}

.icon.active {
    transform: rotate(180deg);
    transition: transform 0.3s;
}

.flexbox>.flex1 {
    flex: 1;
    text-align: start
}

.tabbar>button {
    border: 1px solid #919191;
    font-size: 16px;
    padding: 10px 12px;
    cursor: pointer;
    width: 50%;
}

.tabbar>button.active {
    background-color: #007bff;
    color: #fff;
    border: 1px solid #007bff;
}
</style>
