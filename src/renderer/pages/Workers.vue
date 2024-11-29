<template>
    <div class="worker-page page d-flex gap24 column">
        <div class="worker-top d-flex j-between a-center">
            <h2 class="page-title">Специалист</h2>
            <div class="d-flex a-center gap12">
                <div class="item d-flex a-center gap6 p12">
                    <Icons name="search" />
                    <input type="text" class="worker-search" placeholder="Поиск специалист" />
                </div>
                <div class="create-button" @click="openCreateModal">Создать специалиста</div>
            </div>
        </div>
        <div class="page-bottom">
            <div class="d-flex gap12 column">
                <div class="border9 radius1 d-flex column p12" v-for="data in allWorkers" :key="data._id"
                    @dblclick="toggleArchive(data._id)">
                    <div class="d-flex j-between a-center">
                        <div class="left d-flex a-center gap24">
                            <h3 class="worker-title flex1">{{ data?.name }}</h3>
                            <p class="worker-title flex1">
                                {{ data?.summaType === 'percent' ? 'Процент' : 'Ежемесячно' }}
                            </p>
                            <h3>{{ data.price ? formatSumma(data?.price) : `${data?.percent} %` }}</h3>
                        </div>
                        <div class="right d-flex gap24">
                            <h3>{{ formatSumma(data?.totalCash) }} сум</h3>
                            <div class="d-flex gap12">
                                <Icons name="payed" class="info icon" @click="handleWorkerPay(data._id)" />
                                <Icons name="edit" class="icon info" @click="openEditModal(data)" />
                                <Icons name="deleted" class="icon danger" @click="handleDeleteWorker(data._id)" />
                                <Icons :name="activeArchiveId === data._id ? 'topArrow' : 'bottomArrow'" class="icon"
                                    @click="toggleArchive(data._id)" />
                            </div>
                        </div>
                    </div>

                    <!-- Archive Ma'lumotlarini ko'rsatish -->
                    <div v-if="activeArchiveId === data._id" class="archive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Способ оплаты</th>
                                    <th>Цена</th>
                                    <th>Описание</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in archiveData" :key="item._id">
                                    <td>{{ item?.clientName||item?.status }}</td>
                                    <td>{{ formatSumma(item?.summa||item?.amount) }}</td>
                                    <td>{{formatDate(item?.paymentDate)}}</td>
                                    <td>{{ item?.comment ? item.comment : '-------' }}</td>
                                    <td class="d-flex j-end gap12">
                                        <Icons name="deleted" class="icon danger" @click="handleDeletePayment(item._id)" />
                                        <Icons class="icon"/>
                                    </td>
                                </tr>
                                <tr v-if="!archiveData.length">
                                    <td colspan="5">История недоступна</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-if="!allWorkers?.length" class="d-flex j-center p12 text16">
                    Товаров пока нет
                </div>
            </div>
        </div>
    </div>
    <WorkerCreate :open="isOpen" @close="isOpen = false" @status="handleStatus" :oneWorker="oneWorker" />
    <RequiredModal :isVisible="visible" @response="handleResponse($event)" />
    <Toastiff :toastOptions="toastOptions" />
    <PayedForWorker :open="isPayWorker" :worker="workerId" :editData="editPayment" @close="isPayWorker = false" @status="handleStatus($event)" />
</template>

<script>
import { ipcRenderer } from 'electron';
import eventNames from '@/universal/eventNames';
import Icons from '../components/Icons.vue';
import WorkerCreate from '../models/WorkerCreate.vue';
import Toastiff from '../utils/Toastiff.vue';
import RequiredModal from '../components/requiredModal.vue';
import PayedForWorker from '../models/PayedForWorker.vue';

export default {
    name: "workersPage",
    components: {
        Icons,
        WorkerCreate,
        Toastiff,
        RequiredModal,
        PayedForWorker
    },
    data() {
        return {
            allWorkers: [],       // Barcha workerlar
            archiveData: [],      // Faol workerning archive ma'lumotlari
            activeArchiveId: null, // Qaysi workerning arxivi ochilgan
            isOpen: false,        // Modal holati
            oneWorker: null,      // Bir worker ma'lumotlari
            visible: false,       // Tasdiqlash modal ko'rinishi
            oneId: null,          // Worker ID (delete uchun)
            workerId: null,       // Worker ID (to'lov uchun)
            isPayWorker: false,   // To'lov modal holati
            editPayment: null,    // Tahrirlanayotgan to'lov
            toastOptions: {       // Toast sozlamalari
                open: false,
                text: "",
                style: { background: "#4CAF50" },
            },
        };
    },
    methods: {
        async getAllWorker() {
            try {
                const res = await ipcRenderer.invoke(eventNames.ListWorkerEvent, {});
                if (res.status === 200) {
                    this.allWorkers = res?.data;
                }
            } catch (error) {
                console.error("Error fetching workers:", error);
                this.allWorkers = [];
            }
        },
        async toggleArchive(workerId) {
            if (this.activeArchiveId === workerId) {
                // Arxiv yopish
                this.activeArchiveId = null;
                this.archiveData = [];
            } else {
                // Arxiv ochish
                this.activeArchiveId = workerId;
                try {
                    const res = await ipcRenderer.invoke(eventNames.OneWorkerEvent, { id:workerId });
                    if (res.status === 200) {
                        console.log(res);
                        this.archiveData = [...res.data.payments,...res.data.history] || [];
                    } else {
                        this.archiveData = [];
                        this.showToast("Архив недоступен", "#F44336");
                    }
                } catch (error) {
                    console.error("Error fetching archive:", error);
                    this.showToast("Ошибка при получении архива", "#F44336");
                }
            }
        },
        handleWorkerPay(id) {
            this.workerId = id;
            this.isPayWorker = true;
        },
        handleEditPayment(data) {
            this.editPayment = data;
            this.isPayWorker = true;
        },
        handleDeletePayment(id) {
            console.log("Удаление оплаты с ID:", id);
        },
        handleDeleteWorker(id) {
            this.oneId = id;
            this.visible = true;
        },
       async handleStatus(event){
            if(event){
                await this.getAllWorker();
            }
        },
        async handleResponse(event) {
            this.visible = false;
            if (event) {
                await this.deleteWorker();
                await this.getAllWorker();
            }
        },
        async deleteWorker() {
            try {
                const result = await ipcRenderer.invoke(eventNames.DeleteWorkerHistory, { id: this.oneId });
                if (result.status === 200) {
                    this.showToast("Работник успешно удален", "#4CAF50");
                } else {
                    this.showToast("Ошибка при удалении", "#F44336");
                }
            } catch (error) {
                console.error("Error deleting worker:", error);
                this.showToast("Ошибка при удалении", "#F44336");
            }
        },
        openCreateModal() {
            this.oneWorker = null;
            this.isOpen = true;
        },
        openEditModal(worker) {
            this.oneWorker = worker;
            this.isOpen = true;
        },
        formatSumma(summa) {
            return new Intl.NumberFormat("ru-RU").format(summa);
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString("ru-RU");
        },
        showToast(message, color) {
            this.toastOptions = {
                open: true,
                text: message,
                style: { background: color },
            };
            setTimeout(() => (this.toastOptions.open = false), 3000);
        },
    },
    mounted() {
        this.getAllWorker();
    },
};
</script>

<style>
.left>.flex1:first-child {
    width: 180px;
}

.left>.flex1 {
    width: 100px;
}

.archive {
    margin-top: 20px;
}
</style>