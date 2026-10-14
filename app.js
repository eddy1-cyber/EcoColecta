const STORAGE_KEYS = {
  points: "ecocolecta.points",
  deliveries: "ecocolecta.deliveries",
};

const initialPoints = [
  {
    id: "parque-central",
    name: "Parque Central",
    address: "Av. de la Comunidad 120",
    materials: ["Plástico", "Papel y cartón", "Vidrio"],
  },
  {
    id: "centro-comunitario",
    name: "Centro Comunitario",
    address: "Calle Esperanza 45",
    materials: ["Plástico", "Metal", "Papel y cartón"],
  },
  {
    id: "mercado-local",
    name: "Mercado Local",
    address: "Plaza del Barrio, local 8",
    materials: ["Vidrio", "Orgánicos"],
  },
];

const pointList = document.querySelector("#point-list");
const deliveryList = document.querySelector("#delivery-list");
const deliveryPoint = document.querySelector("#delivery-point");
const formMessage = document.querySelector("#form-message");
const pointMessage = document.querySelector("#point-message");

function readFromStorage(key, fallback) {
  const savedValue = localStorage.getItem(key);
  if (savedValue === null) return fallback;

  try {
    const parsedValue = JSON.parse(savedValue);
    if (!Array.isArray(parsedValue)) throw new Error("El formato guardado no es válido.");
    return parsedValue;
  } catch (error) {
    console.error(`No se pudieron leer los datos de ${key}.`, error);
    showMessage(formMessage, "No se pudieron cargar los datos guardados. Puedes seguir registrando información.", true);
    return fallback;
  }
}

let points = readFromStorage(STORAGE_KEYS.points, initialPoints);
let deliveries = readFromStorage(STORAGE_KEYS.deliveries, []);

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("is-error", isError);
}

function saveToStorage(key, value, messageElement) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`No se pudieron guardar los datos de ${key}.`, error);
    showMessage(messageElement, "No se pudo guardar en este dispositivo. Revisa el espacio disponible y vuelve a intentarlo.", true);
    return false;
  }
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function renderPoints() {
  pointList.replaceChildren();
  deliveryPoint.replaceChildren(new Option("Selecciona un punto", ""));

  points.forEach((point) => {
    const card = createElement("article", "point-card");
    const icon = createElement("span", "point-icon", "⌖");
    icon.setAttribute("aria-hidden", "true");
    const name = createElement("h3", "", point.name);
    const address = createElement("p", "point-address", point.address);
    const materials = createElement("div", "material-list");

    point.materials.forEach((material) => {
      materials.append(createElement("span", "material-tag", material));
    });

    card.append(icon, name, address, materials);
    pointList.append(card);
    deliveryPoint.add(new Option(point.name, point.id));
  });

  document.querySelector("#point-count").textContent = points.length;
}

function renderDeliveries() {
  deliveryList.replaceChildren();

  if (deliveries.length === 0) {
    deliveryList.append(createElement("p", "empty-state", "Aún no hay entregas. ¡Sé la primera persona en registrar una!"));
  }

  deliveries.slice(0, 5).forEach((delivery) => {
    const row = createElement("article", "delivery-row");
    const icon = createElement("span", "delivery-icon", "♻");
    icon.setAttribute("aria-hidden", "true");
    const details = createElement("div", "delivery-details");
    details.append(
      createElement("strong", "", delivery.citizen),
      createElement("span", "", `${delivery.material} · ${delivery.pointName}`),
    );
    const weight = createElement("strong", "delivery-weight", `${delivery.weight} kg`);
    row.append(icon, details, weight);
    deliveryList.append(row);
  });

  const totalWeight = deliveries.reduce((total, delivery) => total + Number(delivery.weight), 0);
  document.querySelector("#delivery-count").textContent = deliveries.length;
  document.querySelector("#weight-total").textContent = `${totalWeight.toLocaleString("es-MX", {
    maximumFractionDigits: 1,
  })} kg`;
}

document.querySelector("#delivery-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const point = points.find((item) => item.id === formData.get("point"));
  const weight = Number(formData.get("weight"));

  if (!point || !point.materials.includes(formData.get("material"))) {
    showMessage(formMessage, "Elige un punto que reciba el material seleccionado.", true);
    return;
  }

  if (!Number.isFinite(weight) || weight < 0.1 || weight > 1000) {
    showMessage(formMessage, "Ingresa un peso entre 0.1 y 1,000 kg.", true);
    return;
  }

  const delivery = {
    id: crypto.randomUUID(),
    citizen: String(formData.get("citizen")).trim(),
    pointName: point.name,
    material: String(formData.get("material")),
    weight,
    createdAt: new Date().toISOString(),
  };

  const updatedDeliveries = [delivery, ...deliveries];
  if (!saveToStorage(STORAGE_KEYS.deliveries, updatedDeliveries, formMessage)) return;

  deliveries = updatedDeliveries;
  renderDeliveries();
  form.reset();
  showMessage(formMessage, "¡Gracias! Tu entrega quedó registrada.");
});

document.querySelector("#point-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const name = String(formData.get("name")).trim();
  const address = String(formData.get("address")).trim();
  const material = String(formData.get("materials"));

  if (!name || !address || !material) {
    showMessage(pointMessage, "Completa todos los datos del punto.", true);
    return;
  }

  const point = {
    id: crypto.randomUUID(),
    name,
    address,
    materials: [material],
  };
  const updatedPoints = [...points, point];
  if (!saveToStorage(STORAGE_KEYS.points, updatedPoints, pointMessage)) return;

  points = updatedPoints;
  renderPoints();
  form.reset();
  showMessage(pointMessage, "¡Punto agregado! Ya está disponible para registrar entregas.");
});

renderPoints();
renderDeliveries();
