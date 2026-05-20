import pandas as pd
import os
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

QUARTER_MAP = {'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4}
QUARTER_REV = {1: 'Q1', 2: 'Q2', 3: 'Q3', 4: 'Q4'}


def load_data(file_name):
    return joblib.load(os.path.join(MODELS_DIR, file_name))


def safe_float(value, default=0.0):
    try:
        if pd.isna(value):
            return default
        return float(value)
    except Exception:
        return default


def get_company_info():
    try:
        company_info = load_data('company_info.pkl')

        companies = []
        for comp in company_info.index:
            row = company_info.loc[comp]
            companies.append({
                "name": comp,
                "symbol": comp,
                "cap_type": row['Cap_Type'],
                "sector": row['Sector']
            })
        return companies

    except Exception as e:
        print(f"Error loading company_info.pkl: {e}")
        return []


def predict_revenue(company_name, target_quarter, target_year):
    try:
        company_info = load_data('company_info.pkl')
        full_df = load_data('full_data.pkl')
        FEATURES = load_data('features.pkl')
    except Exception as e:
        print(f"Error loading models/data: {e}")
        return None

    if company_name not in company_info.index:
        close = [c for c in company_info.index if company_name.lower() in c.lower()]
        if not close:
            return None
        company_name = close[0]

    cap_type = company_info.loc[company_name, 'Cap_Type']
    cap_enc = company_info.loc[company_name, 'Cap_Type_Encoded']
    sector = company_info.loc[company_name, 'Sector']

    try:
        bundle = load_data(f'{cap_type}_model.pkl')
        model = bundle['model']
        scaler = bundle.get('scaler', None)
        company_mean = bundle['company_mean']
        sector_mean = bundle['sector_mean']
        company_errors = bundle.get('company_errors', {})
        global_mape = bundle.get('global_mape', 0.10)
        model_name = bundle.get('model_name', 'Model')
    except Exception as e:
        print(f"Error loading {cap_type}_model.pkl: {e}")
        return None

    tq_num = QUARTER_MAP[target_quarter.upper()]

    lag_q = 4 if tq_num == 1 else tq_num - 1
    lag_year = target_year - 1 if tq_num == 1 else target_year

    comp_df = full_df[full_df['Company'] == company_name].copy()

    if comp_df.empty:
        return None

    comp_df = comp_df.sort_values(['Year', 'Quarter_Type_Encoded'])

    lag_row = comp_df[
        (comp_df['Year'] == lag_year) &
        (comp_df['Quarter_Type_Encoded'] == lag_q)
    ]

    if lag_row.empty:
        lag_row = comp_df.tail(1)

    lag = lag_row.iloc[0]

    latest = full_df.sort_values(['Year', 'Quarter_Type_Encoded']).iloc[-1]

    usd_sectors = ['IT', 'Pharma', 'Auto Ancillary', 'Textiles']
    crude_sectors = ['Energy', 'Chemicals', 'Plastics']
    inflation_sectors = [
        'FMCG', 'Retail', 'Banking', 'Consumer',
        'Cement', 'Infrastructure', 'Building Materials'
    ]

    usd_sig = safe_float(latest.get('USD_INR', 0)) if sector in usd_sectors else 0.0
    crude_sig = safe_float(latest.get('Crude_oil_price', 0)) if sector in crude_sectors else 0.0
    inf_sig = safe_float(latest.get('Inflation', 0)) if sector in inflation_sectors else 0.0

    # IMPORTANT:
    # Revenue_Lag1 for future prediction should be previous quarter actual revenue.
    # Do NOT use Target_Revenue here because Target_Revenue means next quarter revenue.
    if 'Revenue' in lag.index and pd.notna(lag['Revenue']):
        rev_lag1 = safe_float(lag['Revenue'])
    else:
        rev_lag1 = safe_float(lag.get('Revenue_Lag1', 0))

    prof_lag1 = safe_float(lag.get('Profit', lag.get('Profit_Lag1', 0)))
    ebitda_lag1 = safe_float(lag.get('EBITDA', lag.get('EBITDA_Lag1', 0)))
    stock_lag1 = safe_float(lag.get('Stock_Price', lag.get('Stock_Lag1', 0)))

    accel = safe_float(lag.get('Revenue_acceleration', 0))
    momentum = safe_float(lag.get('Price_momentum', 0))

    if isinstance(company_mean, dict):
        company_te = company_mean.get(company_name, np.mean(list(company_mean.values())))
    elif isinstance(company_mean, pd.Series):
        company_te = company_mean.get(company_name, company_mean.mean())
    else:
        company_te = company_mean

    if isinstance(sector_mean, dict):
        sector_te = sector_mean.get(sector, np.mean(list(sector_mean.values())))
    elif isinstance(sector_mean, pd.Series):
        sector_te = sector_mean.get(sector, sector_mean.mean())
    else:
        sector_te = sector_mean

    row = {
        'Cap_Type_Encoded': cap_enc,
        'Quarter_Type_Encoded': tq_num,
        'Company_TargetEncoded': safe_float(company_te),
        'Sector_TargetEncoded': safe_float(sector_te),
        'is_Q4': 1 if tq_num == 4 else 0,
        'is_exceptional': 0,
        'USD_INR_signal': usd_sig,
        'Crude_signal': crude_sig,
        'Inflation_signal': inf_sig,
        'Revenue_Lag1': rev_lag1,
        'Profit_Lag1': prof_lag1,
        'Stock_Lag1': stock_lag1,
        'EBITDA_Lag1': ebitda_lag1,
        'Revenue_acceleration': accel,
        'Price_momentum': momentum,
        'RevLag_x_Cap': rev_lag1 * cap_enc,
        'ProfLag_x_Cap': prof_lag1 * cap_enc,
        'Accel_x_Cap': accel * cap_enc,
        'Moment_x_Cap': momentum * cap_enc,
    }

    try:
        X_df = pd.DataFrame([row])

        # Ensure same feature order as training
        X_df = X_df[FEATURES]

        if scaler:
            X_input = scaler.transform(X_df)
        else:
            X_input = X_df

        pred = float(model.predict(X_input)[0])

    except Exception as e:
        print(f"Prediction error for {company_name}: {e}")
        return None

    if isinstance(company_errors, dict):
        mape_used = company_errors.get(company_name, global_mape)
    elif isinstance(company_errors, pd.Series):
        mape_used = company_errors.get(company_name, global_mape)
    else:
        mape_used = global_mape

    mape_used = safe_float(mape_used, 0.10)

    lower = pred * (1 - mape_used)
    upper = pred * (1 + mape_used)

    growth_percent = 0.0
    if rev_lag1 > 0:
        growth_percent = ((pred - rev_lag1) / rev_lag1) * 100

    sorted_comp_df = comp_df.sort_values(['Year', 'Quarter_Type_Encoded']).tail(8)

    historical = []
    for _, r in sorted_comp_df.iterrows():
        q_str = f"{QUARTER_REV[int(r['Quarter_Type_Encoded'])]} {int(r['Year'])}"

        # For historical chart, use actual current revenue.
        # Do NOT use Target_Revenue because it shifts the chart forward.
        if 'Revenue' in r.index and pd.notna(r['Revenue']):
            rev_val = safe_float(r['Revenue'])
        else:
            rev_val = safe_float(r.get('Revenue_Lag1', 0))

        historical.append({
            "quarter": q_str,
            "revenue": round(rev_val, 2)
        })

    return {
        "company": company_name,
        "cap_type": cap_type,
        "sector": sector,
        "model_used": model_name,
        "prediction_quarter": f"{target_quarter.upper()} {target_year}",
        "predicted_revenue": round(pred, 2),
        "growth_percent": round(growth_percent, 2),
        "confidence_range": [round(lower, 2), round(upper, 2)],
        "accuracy": round(mape_used * 100, 2),
        "historical_data": historical
    }


def get_summary(quarter: str, year: int):
    try:
        company_info = load_data('company_info.pkl')
    except Exception:
        return []

    summary = []
    for comp in company_info.index:
        pred = predict_revenue(comp, quarter, year)
        if pred:
            summary.append({
                "company": pred["company"],
                "sector": pred["sector"],
                "cap_type": pred["cap_type"],
                "predicted_revenue": pred["predicted_revenue"],
                "growth_percent": pred["growth_percent"]
            })

    return summary
