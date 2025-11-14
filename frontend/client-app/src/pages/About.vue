<!-- File: src/views/About.vue -->
<template>
    <div>
        <PageHeader title="About AURA" />

        <section class="section container">
            <div class="about-grid">
                <div class="about-image">
                    <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Our Story">
                </div>
                <div class="about-content">
                    <h2>Our Story</h2>
                    <p>AURA is not just a brand; it's a philosophy. We believe in the power of clothing to transform and empower. Our journey began with a simple idea: to create beautiful, high-quality pieces that are both timeless and modern. We are passionate about craftsmanship, and we work with skilled artisans to bring our vision to life. Every piece in our collection is designed with intention, and we hope it brings you as much joy as it brought us to create.</p>
                </div>
            </div>
        </section>

        <section class="section values-section">
            <div class="container">
                <h2 class="section-title">Our Values</h2>
                <div class="values-grid">
                    <div class="value-card">
                        <h3>Ethical Production</h3>
                        <p>We are committed to ethical manufacturing and fair labor practices. We partner with artisans and factories that share our values of transparency and respect.</p>
                    </div>
                    <div class="value-card">
                        <h3>Sustainable Materials</h3>
                        <p>We prioritize natural, recycled, and innovative materials that minimize our environmental impact. We believe in fashion that is gentle on the planet.</p>
                    </div>
                    <div class="value-card">
                        <h3>Timeless Design</h3>
                        <p>We create pieces that transcend trends. Our focus is on quality, fit, and versatility, ensuring that your AURA pieces will be cherished for years to come.</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import PageHeader from '../components/PageHeader.vue';
</script>

<style scoped>
.about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
    align-items: center;
}

.about-grid img {
    width: 100%;
    border-radius: 12px;
}

.about-content h2 {
    font-size: 2.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--c5);
}

.about-content p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #555;
}

.values-section {
    background-color: #fff;
}

.values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
    text-align: center;
}

.value-card h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--c6);
}

.value-card p {
    font-size: 1rem;
    line-height: 1.7;
    color: #555;
}

@media (max-width: 992px) {
    .about-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
    }
}

@media (max-width: 768px) {
    .about-content h2 {
        font-size: 2rem;
    }
    .values-grid {
        grid-template-columns: 1fr;
    }
}
</style>

