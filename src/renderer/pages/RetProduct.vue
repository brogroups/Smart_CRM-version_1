<template>
    <div class="page product gap24 d-flex column">
        <div class="product-top w-100 d-flex j-between a-center">
            <h2 class="page-title">Возврат продукты</h2>
            <div class=" page-top-buttons d-flex a-center gap12 j-end">
                <div class="border2 d-flex a-center gap6 p-0-12 gap12 radius1">
                    <Icons name="search" />
                    <input type="text" class="worker-search" placeholder="Поиск специалист" v-model="searchText">
                </div>                
                <button @click="handleOpenModal" class="create-button">Создать возврат продукт</button>
            </div>
        </div>
        <div class="relative product-bottom page-bottom">
            <table>
                <thead>
                    <tr>
                        <th>Имя клиента</th>
                        <th>Продукт</th>
                        <th>Цена</th>
                        <th>Адрес</th>
                        <th>Дата</th>
                        <th>Описание</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="data in filteredProduct" :key="data.index">
                        <td>{{ data?.clientName }}</td>
                        <td>{{ data?.productName }}</td>
                        <td>{{ formatSumma(data?.price) }}</td>
                        <td>{{ data.address }}</td>
                        <td>{{ formatDate(data?.date) }}</td>
                        <td>{{ data.comment }}</td>
                        <td class="d-flex gap12 a-center j-end">
                            <Icons name="edit" class="icon info" @click="editReturnProduct(data)" />
                            <Icons name="deleted" class="icon danger" @click="deleteOpenReq(data._id)" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!filteredProduct?.length" class="d-flex j-center p12 text16">Товаров пока нет</div>
        </div>
    </div>
    <ReturnCreate :open="isOpen" @close="isOpen = false" :oneRet="oneReturnProduct" @status="handlePiano($event)" />
    <RequiredModal :isVisible="visible" @response="handleResponse($event)" />
    <Toastiff :toastOptions="toastOptions" />
</template>
<script>
import { ipcRenderer } from 'electron';
import Icons from '../components/Icons.vue';
import eventNames from '@/universal/eventNames';
import ReturnCreate from '../models/returnCreate.vue';
import RequiredModal from '../components/requiredModal.vue';
import Toastiff from '../utils/Toastiff.vue';

export default {
    components: {
        Icons,
        ReturnCreate,
        RequiredModal,
        Toastiff
    },
    watch: {
        searchText(newVal) {
            this.filteredProduct = this.allProduct.filter((product) => {
                return (
                    product.clientName?.toLowerCase().includes(newVal.toLowerCase()) ||
                    product.productName?.toLowerCase().includes(newVal.toLowerCase()) ||
                    product.address?.toLowerCase().includes(newVal.toLowerCase())
                );
            });
        },
    },
    data() {
        return {
            allProduct: [],
            filteredProduct: [],
            isOpen: false,
            oneReturnProduct: null,
            searchText: "",
            toastOptions: {
                open: false,
                text: "",
                style: { background: "#4CAF50" },
            },
            visible: false, // RequiredModal holati
            deleteId: null, // O'chirilishi kerak bo'lgan mahsulot ID
        };
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString("ru-RU");
        },
        formatSumma(summa) {
            return new Intl.NumberFormat("ru-RU").format(summa);
        },
        editReturnProduct(data) {
            this.oneReturnProduct = data;
            this.isOpen = true;
        },
        handlePiano(event) {
            if (event) {
                this.listReturned()
                this.toastOptions = {
                    open: true,
                    text: "Успешно создан недействительный продукт",
                    style: { background: "#4CAF50" },
                }
            } else {
                this.toastOptions = {
                    open: true,
                    text: "Ошибка создания недопустимого продукта",
                    style: { background: "#F44336" },
                }
            }
        },
        async listReturned() {
            await ipcRenderer.invoke(eventNames.listInvalidEvent, {})
                .then((res) => {
                    if (res.status == 200) {
                        this.allProduct = res.data;
                        this.filteredProduct = res.data; 
                    }
                });
        },
        handleOpenModal() {
            this.oneReturnProduct = null
            this.isOpen = true
        },
        deleteOpenReq(id) {
            this.visible = true;
            this.deleteId = id;
        },
        async deleteProduct() {
            if (!this.deleteId) return;
            await ipcRenderer.invoke(eventNames.deleteInvalidEvent, { id: this.deleteId })
                .then((res) => {
                    if (res.status == 200) {
                        this.toastOptions = {
                            open: true,
                            text: "Продукт успешно удалён!",
                            style: { background: "#4CAF50" },
                        };
                        this.listReturned(); // Ma'lumotlarni qayta yuklash
                    } else {
                        this.toastOptions = {
                            open: true,
                            text: "Ошибка при удалении продукта.",
                            style: { background: "#F44336" },
                        };
                    }
                });
            this.visible = false; // Modal yopiladi
            this.deleteId = null; // ID tozalanadi
        },
        handleResponse(response) {
            if (response === true) {
                this.deleteProduct(); // Tasdiqlangan bo‘lsa o‘chirish
            } else {
                this.visible = false; // Modalni yopish
            }
        }
    },
    mounted() {
        this.listReturned();
    }
};
</script>

<style></style>