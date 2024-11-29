<template>
    <div class="page d-flex column gap24">
        <div class="page-top d-flex j-between a-center">
            <h2>Мои продукты</h2>
            <div class="create-button" @click="openCreateModal">Создание продукта</div>
        </div>
        <div class="page-bottom">
            <table>
                <thead>
                    <tr>
                        <th>Название продукта</th>
                        <th>Цена продукта</th>
                        <!-- <th>Цвета</th> -->
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="data in allData" :key="data.index">
                        <td>{{ data?.title }}</td>
                        <td>{{ formatSumma(data?.price) }}</td>
                        <!-- <td>
                            <p style="display: inline-block; margin-left:12px;" v-for="color in data.colors"
                                :key="color.index">{{ color }}</p>
                        </td> -->
                        <td class="d-flex gap12 j-end a-center">
                            <Icons name="edit" class="info icon" @click="openEditModal(data)" />
                            <Icons name="deleted" class="danger icon" @click="confirmDelete(data._id)" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!allData?.length" class="d-flex j-center p12 text16">Шаблон   пока нет</div>
        </div>
    </div>
    <ShablonCreate :open="isOpen" :product="currentProduct" @close="isOpen = false; resetProduct()"
        @status="onProductActionSuccess" />
    <RequiredModal :isVisible="visible" @response="handleDeleteResponse($event)" />
    <Toastiff :toastOptions="toastOptions" />
</template>

<script>
import { ipcRenderer } from 'electron';
import ShablonCreate from '../models/ShablonCreate.vue';
import eventNames from '@/universal/eventNames';
import Icons from '../components/Icons.vue';
import RequiredModal from '../components/requiredModal.vue';
import Toastiff from '../utils/Toastiff.vue';

export default {
    name: "MyProducts",
    components: {
        ShablonCreate,
        Icons,
        RequiredModal,
        Toastiff
    },
    data() {
        return {
            isOpen: false,
            visible: false,
            currentProduct: null,
            allData: [],
            toastOptions: {
                open: false,
                text: '',
                style: {}
            },
        };
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString("ru-RU");
        },
        formatSumma(summa) {
            return new Intl.NumberFormat("ru-RU").format(summa);
        },
        async allShablon() {
            await ipcRenderer.invoke(eventNames.listMyProductEvent, {})
                .then((res) => {
                    if (res.status == 200) {
                        this.allData = res?.data;
                    }
                });
        },
        openCreateModal() {
            this.currentProduct = null;
            this.isOpen = true;
        },
        openEditModal(product) {
            this.currentProduct = product;
            this.isOpen = true;
        },
        confirmDelete(productId) {
            this.oneProductId = productId;
            this.visible = true;
        },
        handleDeleteResponse(response) {
            if (response) {
                this.deleteProduct();
            } else {
                this.visible = false;
            }
        },
        async deleteProduct() {
            try {
                const result = await ipcRenderer.invoke(eventNames.deleteMyProductEvent, JSON.parse(JSON.stringify({ id: this.oneProductId })));
                if (result.status === 200) {
                    this.toastOptions = {
                    open: true,
                    text: "Продукт успешно удалён!",
                    style: { background: "#4CAF50" },
                };
                    this.allShablon();
                } else {
                    this.toastOptions = {
                    open: true,
                    text: "Операция выполнена успешно.",
                    style: { background: "#F44336" },
                };
                }
            } catch (error) {
                this.toastOptions = {
                    open: true,
                    text: "Ошибка при удалении продукта!.",
                    style: { background: "#F44336" },
                };
            } finally {
                this.visible = false;
            }
        },
        resetProduct() {
            this.currentProduct = null;
        },
        onProductActionSuccess(message) {
            this.allShablon();
            if (message !== 'error') {
                this.toastOptions = {
                    open: true,
                    text: "Товар успешно добавлен",
                    style: { background: "#4CAF50" },
                };
            }else{
                this.toastOptions = {
                    open: true,
                    text: "Ошибка при добавлении товара",
                    style: { background: "#F44336" },
                };
            }

        }
    },
    mounted() {
        this.allShablon();
    }
};
</script>

<style>
/* Add your styles if necessary */
</style>
