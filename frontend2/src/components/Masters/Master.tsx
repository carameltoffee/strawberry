import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { GetMasterById } from "./Masters.thunks";
import Avatar from "../Avatar/Avatar";
import { useAppDispatch } from "../../hooks/hooks";
import WorksSlider from "../Works/WorksSlider";

type MasterProps = {
	masterId: string;
};

const Master: React.FC<MasterProps> = ({ masterId }) => {
	const dispatch = useAppDispatch();

	const master = useSelector(
		(state: RootState) => state.masters.mastersById[masterId]
	) as IUser | undefined;

	const isLoading = useSelector((state: RootState) => state.masters.loading);
	const error = useSelector((state: RootState) => state.masters.error);

	useEffect(() => {
		if (!master) {
			dispatch(GetMasterById(masterId));
		}
	}, [dispatch, masterId, master]);

	if (isLoading) return <div>Загрузка мастера...</div>;

	if (error || !master) return <div style={{ color: "red" }}>Ошибка: {error}</div>;

	return (
		<div
			style={{
				maxWidth: "100%",
				width: "100%",
				margin: "0 auto",
				padding: 20,
				display: "flex",
				gap: 20,
				alignItems: "flex-start",
				flexWrap: "wrap",  
			}}
		>
			<div style={{ flex: "1 1 40%", minWidth: 250 }}>
				<Avatar userId={masterId} />
				<h1>{master.full_name}</h1>
				<p>
					<strong>Username:</strong> {master.username}
				</p>
				{master.specialization && (
					<p>
						<strong>Специализация:</strong> {master.specialization}
					</p>
				)}
				<p>
					<strong>Зарегистрирован:</strong>{" "}
					{new Date(master.registered_at).toLocaleDateString()}
				</p>
			</div>

			<div style={{ flex: "1 1 60%" }}>
				<WorksSlider userId={masterId} />
			</div>
		</div>
	);
};

export default Master;
