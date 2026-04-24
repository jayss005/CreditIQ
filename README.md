# CreditIQ — Credit Approval Prediction

AI-powered credit risk assessment using a Gradient Boosting classifier.

## Setup

### Backend

```bash
cd credit-iq/backend
pip install -r requirements.txt
```

Place your trained `credit_model.pkl` in the `backend/` directory, then start the server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd credit-iq/frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## How it works

CreditIQ uses a **Gradient Boosting classifier** (scikit-learn Pipeline with StandardScaler) trained on the UCI Credit Card Applications dataset.

**Model Performance:**
| Metric    | Score   |
|-----------|---------|
| Accuracy  | 87.66%  |
| Precision | 87.83%  |
| Recall    | 99.75%  |
| F1-Score  | 93.41%  |

The model takes 52 features (after one-hot encoding) covering:
- **Personal**: Gender, age, education level
- **Family & Housing**: Marital status, children, housing type, car/property ownership
- **Income & Employment**: Annual income, income type, occupation, years employed
- **Contact**: Work phone, home phone, email flags
- **Engineered**: Income per family member, employed flag, age squared

The FastAPI backend accepts structured applicant data, performs inline feature engineering (computing `INCOME_PER_FAMILY_MEMBER`, `EMPLOYED_FLAG`, `AGE_YEARS_sq`), and returns:
- Binary prediction (Approved / Rejected)
- Approval probability
- Risk score (rejection probability)

The React frontend provides a rich form interface with real-time validation, and displays results with an animated probability gauge, contextual risk signals, and model recommendations.

## Notes

- **Not for production financial use** — this is a demonstration application
- Model trained on the UCI Credit Card Applications dataset
- The prediction should be used as one input among many in a credit decision process
