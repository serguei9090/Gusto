import { useEffect } from "react";
import { useIngredientStore } from "./store/ingredientStore";
import { Button } from "./components/atoms/Button";
import { Input } from "./components/atoms/Input";
import { Label } from "./components/atoms/Label";

function App() {
    const { ingredients, fetchIngredients, isLoading, error } =
        useIngredientStore();

    useEffect(() => {
        fetchIngredients();
    }, [fetchIngredients]);

    return (
        <div className="container">
            <h1>RestaurantManage</h1>
            <p className="subtitle">Recipe Costing & Inventory Management</p>

            <div className="demo-section">
                <h2>Database Status</h2>
                {error && <div className="error-box">Error: {error}</div>}
                {isLoading ? (
                    <p>Loading ingredients...</p>
                ) : (
                    <p className="success-box">
                        ✅ Connected to SQLite via Tauri Plugin! {ingredients.length} ingredients loaded.
                    </p>
                )}
            </div>

            <div className="demo-section">
                <h2>Component Demo</h2>

                <div className="component-grid">
                    <div>
                        <Label htmlFor="test-input" required>
                            Test Input Field
                        </Label>
                        <Input
                            id="test-input"
                            type="text"
                            placeholder="Enter ingredient name..."
                            fullWidth
                        />
                    </div>

                    <div>
                        <Label htmlFor="error-input">Input with Error</Label>
                        <Input
                            id="error-input"
                            type="text"
                            error="This field is required"
                            fullWidth
                        />
                    </div>
                </div>

                <div className="button-group">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="danger">Delete</Button>
                    <Button variant="ghost">Cancel</Button>
                    <Button variant="primary" isLoading>
                        Loading...
                    </Button>
                </div>
            </div>

            <div className="demo-section">
                <h2>Next Steps</h2>
                <ul className="checklist">
                    <li>✅ Native SQLite via Tauri Plugin</li>
                    <li>✅ No custom Rust code required</li>
                    <li>✅ Zustand store connected</li>
                    <li>✅ Atom components ready</li>
                    <li>🔨 Build ingredient CRUD UI</li>
                    <li>🔨 Create ingredient table</li>
                </ul>
            </div>

            <p className="footer">
                Built with Tauri 2.x + React 19 + TypeScript + SQLite Plugin
            </p>
        </div>
    );
}

export default App;
