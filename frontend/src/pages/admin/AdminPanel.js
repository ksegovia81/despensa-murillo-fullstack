import React, { useState } from 'react';
import AdminOverview from './AdminOverview';
import AdminProductsView from './AdminProductsView';
import AdminOrdersView from './AdminOrdersView';
import AdminDiscountsView from './AdminDiscountsView';

const AdminPanel = ({ adminStats, products, loadAdminProducts, discounts, loadDiscounts }) => {
  const [adminView, setAdminView] = useState('overview');

  switch (adminView) {
    case 'products':
      return <AdminProductsView setAdminView={setAdminView} products={products} loadAdminProducts={loadAdminProducts} />;
    case 'orders':
      return <AdminOrdersView setAdminView={setAdminView} />;
    case 'discounts':
      return <AdminDiscountsView setAdminView={setAdminView} discounts={discounts} loadDiscounts={loadDiscounts} />;
    default:
      return <AdminOverview setAdminView={setAdminView} adminStats={adminStats} products={products} />;
  }
};

export default AdminPanel;
