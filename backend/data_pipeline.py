import pandas as pd
import numpy as np
import random
import uuid
import os
import sqlite3

# PM-JAY procedure baseline costs (expected amount range in INR)
# Based on actual PMJAY package rates
PROCEDURE_BASELINES = {
    'PROC_001': {'name': 'General Ward Admission', 'min': 1000, 'max': 5000},
    'PROC_002': {'name': 'Cataract Surgery', 'min': 8000, 'max': 15000},
    'PROC_003': {'name': 'Appendectomy', 'min': 15000, 'max': 35000},
    'PROC_004': {'name': 'Knee Replacement', 'min': 80000, 'max': 150000},
    'PROC_005': {'name': 'CABG (Heart Bypass)', 'min': 150000, 'max': 250000},
    'PROC_006': {'name': 'Hip Replacement', 'min': 85000, 'max': 160000},
    'PROC_007': {'name': 'Dialysis (per session)', 'min': 800, 'max': 1500},
    'PROC_008': {'name': 'Chemotherapy', 'min': 15000, 'max': 50000},
    'PROC_009': {'name': 'Normal Delivery', 'min': 3000, 'max': 9000},
    'PROC_010': {'name': 'C-Section', 'min': 8000, 'max': 18000},
    'PROC_011': {'name': 'Hernia Repair', 'min': 12000, 'max': 28000},
    'PROC_012': {'name': 'Tonsillectomy', 'min': 7000, 'max': 18000},
    'PROC_013': {'name': 'Spinal Fusion', 'min': 100000, 'max': 200000},
    'PROC_014': {'name': 'Renal Transplant', 'min': 200000, 'max': 350000},
    'PROC_015': {'name': 'Hysterectomy', 'min': 18000, 'max': 40000},
    'PROC_016': {'name': 'Cholecystectomy', 'min': 14000, 'max': 30000},
    'PROC_017': {'name': 'Angioplasty', 'min': 80000, 'max': 150000},
    'PROC_018': {'name': 'ICU Admission (per day)', 'min': 4000, 'max': 10000},
    'PROC_019': {'name': 'Neonatal Care', 'min': 5000, 'max': 20000},
    'PROC_020': {'name': 'CT Scan', 'min': 800, 'max': 3000},
}
# Fill remaining procedures with generic rates
for i in range(21, 51):
    PROCEDURE_BASELINES[f'PROC_{i:03d}'] = {'name': f'Medical Procedure {i}', 'min': 5000, 'max': 50000}

# Indian state risk profiles based on CAG audit
STATE_RISK_PROFILES = {
    'Maharashtra': {'base_risk': 25, 'primary_fraud': 'Image Reuse', 'threat_level': 'High'},
    'Uttar Pradesh': {'base_risk': 40, 'primary_fraud': 'Duplicate Claims', 'threat_level': 'Critical'},
    'Karnataka': {'base_risk': 20, 'primary_fraud': 'Upcoding', 'threat_level': 'Elevated'},
    'Tamil Nadu': {'base_risk': 22, 'primary_fraud': 'Ghost Beneficiaries', 'threat_level': 'Elevated'},
    'Gujarat': {'base_risk': 18, 'primary_fraud': 'Procedure Mismatch', 'threat_level': 'Low'},
    'Kerala': {'base_risk': 30, 'primary_fraud': 'Dead Patient Claims', 'threat_level': 'High'},
    'Rajasthan': {'base_risk': 35, 'primary_fraud': 'Duplicate Claims', 'threat_level': 'High'},
    'Madhya Pradesh': {'base_risk': 38, 'primary_fraud': 'Ghost Beneficiaries', 'threat_level': 'Critical'},
    'Bihar': {'base_risk': 45, 'primary_fraud': 'Concurrent Claims', 'threat_level': 'Critical'},
    'West Bengal': {'base_risk': 28, 'primary_fraud': 'Upcoding', 'threat_level': 'High'},
}

def load_mock_data():
    np.random.seed(42)
    random.seed(42)
    
    n_records = 10000
    
    # Load base Kaggle dataset
    csv_path = os.path.join(os.path.dirname(__file__), 'insurance.csv')
    try:
        base_df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print("Warning: insurance.csv not found. Falling back to synthetic generation.")
        base_df = None
        
    states = list(STATE_RISK_PROFILES.keys())
    elevated_states = ['Bihar', 'Uttar Pradesh', 'Madhya Pradesh']
    
    hospitals = [f'HOSP_{i:04d}' for i in range(1, 101)]
    high_risk_hospitals = ['HOSP_0013', 'HOSP_0042', 'HOSP_0077', 'HOSP_0099']
    procedures = list(PROCEDURE_BASELINES.keys())
    
    # Map each hospital to a state
    hospital_to_state = {h: np.random.choice(states) for h in hospitals}
    
    claim_ids = [f'CLM_{uuid.uuid4().hex[:8].upper()}' for _ in range(n_records)]
    # Generate realistic patient IDs (some shared for concurrent claim simulation)
    patient_pool = [f'PMJAY-{random.randint(1000000, 9999999)}' for _ in range(int(n_records * 0.9))]
    # Add flagged ghost/problematic IDs
    ghost_ids = ['PMJAY-9999999'] * 50 + ['PMJAY-0000001'] * 30  # shared fake numbers
    patient_ids = [random.choice(patient_pool + ghost_ids) for _ in range(n_records)]
    
    hospital_assignments = np.random.choice(hospitals, n_records)
    state_assignments = [hospital_to_state[h] for h in hospital_assignments]
    procedure_assignments = np.random.choice(procedures, n_records)
    
    if base_df is not None and not base_df.empty:
        sampled_df = base_df.sample(n=n_records, replace=True, random_state=42).reset_index(drop=True)
        claim_amounts = np.round(sampled_df['charges'].values, 2)
    else:
        claim_amounts = np.random.lognormal(mean=9., sigma=1., size=n_records)
        claim_amounts = np.round(claim_amounts, 2)
    
    # Initialize flags and scores
    image_reuse_flag = np.zeros(n_records, dtype=int)
    duplicate_flag = np.zeros(n_records, dtype=int)
    concurrent_flag = np.zeros(n_records, dtype=int)
    upcoding_flag = np.zeros(n_records, dtype=int)
    ghost_beneficiary_flag = np.zeros(n_records, dtype=int)
    anomaly_scores = np.random.uniform(0, 0.3, n_records)
    risk_scores = np.zeros(n_records)
    
    # 5% image reuse
    image_reuse_indices = np.random.choice(n_records, int(0.05 * n_records), replace=False)
    image_reuse_flag[image_reuse_indices] = 1
    
    # 5% duplicate claims
    duplicate_indices = np.random.choice(n_records, int(0.05 * n_records), replace=False)
    duplicate_flag[duplicate_indices] = 1
    
    # 2% concurrent claims (teleportation fraud)
    concurrent_indices = np.random.choice(n_records, int(0.02 * n_records), replace=False)
    concurrent_flag[concurrent_indices] = 1
    
    # Ghost beneficiary flag for fake patient IDs
    for i in range(n_records):
        if patient_ids[i] in ['PMJAY-9999999', 'PMJAY-0000001']:
            ghost_beneficiary_flag[i] = 1
    
    # Upcoding: claim amount > 95th percentile of procedure baseline
    for i in range(n_records):
        proc = procedure_assignments[i]
        baseline = PROCEDURE_BASELINES.get(proc, {'min': 5000, 'max': 50000})
        # Convert insurance.csv dollars to approximate INR * 80
        claim_inr = claim_amounts[i] * 80
        if claim_inr > baseline['max'] * 1.5:
            upcoding_flag[i] = 1
    
    # Calculate composite risk scores
    for i in range(n_records):
        hosp = hospital_assignments[i]
        st = state_assignments[i]
        state_profile = STATE_RISK_PROFILES.get(st, {'base_risk': 20})
        
        base_risk = random.uniform(0, 20) + state_profile['base_risk'] * 0.2
        
        if image_reuse_flag[i] == 1:
            base_risk += random.uniform(40, 60)
            anomaly_scores[i] = max(anomaly_scores[i], random.uniform(0.7, 0.95))
            
        if duplicate_flag[i] == 1:
            base_risk += random.uniform(30, 50)
            anomaly_scores[i] = max(anomaly_scores[i], random.uniform(0.6, 0.9))
            
        if concurrent_flag[i] == 1:
            base_risk += random.uniform(50, 70)
            anomaly_scores[i] = max(anomaly_scores[i], random.uniform(0.8, 0.99))
            
        if ghost_beneficiary_flag[i] == 1:
            base_risk += random.uniform(35, 55)
            anomaly_scores[i] = max(anomaly_scores[i], random.uniform(0.75, 0.95))
            
        if upcoding_flag[i] == 1:
            base_risk += random.uniform(20, 40)
            anomaly_scores[i] = max(anomaly_scores[i], random.uniform(0.5, 0.8))
            
        if hosp in high_risk_hospitals:
            if random.random() < 0.3:
                base_risk += random.uniform(50, 70)
                anomaly_scores[i] = max(anomaly_scores[i], random.uniform(0.7, 0.9))
                
        if st in elevated_states:
            base_risk += random.uniform(10, 20)
            
        if random.random() < 0.02:
            base_risk += random.uniform(60, 80)
            anomaly_scores[i] = random.uniform(0.8, 1.0)
            
        risk_scores[i] = min(max(base_risk, 0), 100)
        
    risk_categories = []
    for score in risk_scores:
        if score <= 30:
            risk_categories.append('Low')
        elif score <= 60:
            risk_categories.append('Medium')
        elif score <= 80:
            risk_categories.append('High')
        else:
            risk_categories.append('Critical')

    # Compute upcoding deviation per record
    upcoding_deviations = []
    for i in range(n_records):
        proc = procedure_assignments[i]
        baseline = PROCEDURE_BASELINES.get(proc, {'min': 5000, 'max': 50000})
        expected_mid = (baseline['min'] + baseline['max']) / 2
        actual_inr = claim_amounts[i] * 80
        deviation = round(((actual_inr - expected_mid) / expected_mid) * 100, 2)
        upcoding_deviations.append(deviation)
            
    df = pd.DataFrame({
        'claim_id': claim_ids,
        'patient_id': patient_ids,
        'hospital_id': hospital_assignments,
        'state': state_assignments,
        'procedure_code': procedure_assignments,
        'claim_amount': claim_amounts,
        'anomaly_score': np.round(anomaly_scores, 4),
        'image_reuse_flag': image_reuse_flag,
        'duplicate_flag': duplicate_flag,
        'concurrent_flag': concurrent_flag,
        'ghost_flag': ghost_beneficiary_flag,
        'upcoding_flag': upcoding_flag,
        'upcoding_deviation': upcoding_deviations,
        'risk_score': np.round(risk_scores, 2),
        'risk_category': risk_categories,
        'is_suspicious': (np.array(risk_scores) > 60).astype(int)
    })
    
    return df

def persist_to_sqlite(df: pd.DataFrame, db_path: str = None) -> str:
    """Persist the claims DataFrame to a local SQLite database."""
    if db_path is None:
        db_path = os.path.join(os.path.dirname(__file__), 'claims.db')
    conn = sqlite3.connect(db_path)
    df.to_sql('claims', conn, if_exists='replace', index=False)
    # Create indexes for fast querying
    conn.execute('CREATE INDEX IF NOT EXISTS idx_hospital ON claims(hospital_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_state    ON claims(state)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_risk     ON claims(risk_score)')
    conn.commit()
    conn.close()
    print(f"[DB] {len(df)} claims persisted to {db_path}")
    return db_path

def load_from_sqlite(db_path: str = None) -> pd.DataFrame:
    """Load claims from SQLite (if available), otherwise regenerate."""
    if db_path is None:
        db_path = os.path.join(os.path.dirname(__file__), 'claims.db')
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        df = pd.read_sql('SELECT * FROM claims', conn)
        conn.close()
        print(f"[DB] Loaded {len(df)} claims from {db_path}")
        return df
    # Fallback: generate fresh
    return load_mock_data()

if __name__ == "__main__":
    df = load_mock_data()
    print(df.head())
    print("\nRisk Category Distribution:")
    print(df['risk_category'].value_counts())
    print("\nNew Fraud Flags:")
    print(f"  Ghost Beneficiaries: {df['ghost_flag'].sum()}")
    print(f"  Concurrent Claims:   {df['concurrent_flag'].sum()}")
    print(f"  Upcoding Cases:      {df['upcoding_flag'].sum()}")
    print(f"  Total Claims: {len(df)}")
