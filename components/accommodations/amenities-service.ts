// Tipos para as comodidades
export interface Amenity {
  id: string
  name: string
  icon: string
  category: string
}

// Dados iniciais de comodidades
export const defaultAmenities: Amenity[] = [
  { id: "wifi", name: "Wi-Fi", icon: "wifi", category: "tecnologia" },
  { id: "tv", name: "TV", icon: "tv", category: "tecnologia" },
  { id: "ar-condicionado", name: "Ar-condicionado", icon: "fan", category: "conforto" },
  { id: "frigobar", name: "Frigobar", icon: "refrigerator", category: "conforto" },
  { id: "banheira", name: "Banheira", icon: "bath", category: "banheiro" },
  { id: "chuveiro", name: "Chuveiro", icon: "shower", category: "banheiro" },
  { id: "secador", name: "Secador de cabelo", icon: "hair-dryer", category: "banheiro" },
  { id: "cafe", name: "Cafeteira", icon: "coffee", category: "cozinha" },
  { id: "microondas", name: "Micro-ondas", icon: "microwave", category: "cozinha" },
  { id: "estacionamento", name: "Estacionamento", icon: "car", category: "serviços" },
  { id: "piscina", name: "Acesso à piscina", icon: "pool", category: "lazer" },
  { id: "academia", name: "Academia", icon: "dumbbell", category: "lazer" },
]

// Função para obter todas as comodidades (versão simplificada)
export const getAmenities = (): Promise<Amenity[]> => {
  return Promise.resolve(defaultAmenities)
}

// Função para salvar comodidades (mock)
export const saveAmenities = (amenities: Amenity[]): Promise<boolean> => {
  return Promise.resolve(true)
}

// Função para adicionar uma comodidade (mock)
export const addAmenity = async (amenity: Amenity): Promise<boolean> => {
  return Promise.resolve(true)
}

// Função para atualizar uma comodidade (mock)
export const updateAmenity = async (id: string, amenity: Amenity): Promise<boolean> => {
  return Promise.resolve(true)
}

// Função para excluir uma comodidade (mock)
export const deleteAmenity = async (id: string): Promise<boolean> => {
  return Promise.resolve(true)
}
